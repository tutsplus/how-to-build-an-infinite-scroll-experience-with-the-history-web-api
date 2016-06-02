/**
 * KeepScrolling - v4.0.0
 * https://github.com/tfirdaus/web-api-history-infinite-scroll
 * Made By Thoriq Firdaus
 *
 * jQuey Boilerplate
 * http://jqueryboilerplate.com
 * Made by Zeno Rocha
 *
 * Under MIT License
 */

// The semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

	"use strict";

		// Undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// Window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "keepScrolling";
		var defaults = {
				article: null,
				floor: null,
				data: {}
			};

		var articleFetching = false;
		var articleEnding = false;

		// The actual plugin constructor
		function Plugin ( element, options ) {

			this.element = element;

			// JQuery has an extend mesthod which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;

			this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {

			/**
			 * Initialize.
			 * @return {Void}
			 */
			init: function() {

				this.roofLine = Math.ceil( window.innerHeight * 0.4 );
				this.siteFloor = $( this.settings.floor );

				this.addPlaceholder();

				this.fetch();
				this.scroller();
			},

			/**
			 * Find and returns a list of articles on the page.
			 * @return {jQuery Object} List of selected articles.
			 */
			getArticles: function() {
				return $( this.element ).find( this.settings.article );
			},

			/**
			 * Returns the article Address.
			 * @param  {Integer} i The article index.
			 * @return {String}    The article address, e.g. post-two.html
			 */
			getArticleAddr: function( i ) {

				var href = window.location.href;
				var root = href.substr( 0, href.lastIndexOf( "/" ) );

				return root + "/" + this.settings.data[ i ].address + ".html";
			},

			/**
			 * Return the next article.
			 * @return {Object} The `id` and `url` of the next article.
			 */
			getNextArticle: function() {

				var $last = this.getArticles().last();

				var articlePrevURL;

				var articleID = $last.data( "article-id" );
				var articlePrevID = parseInt( articleID, 10 ) - 1; // Previous ID

				for ( var i = this.settings.data.length - 1; i >= 0; i-- ) {
					if ( this.settings.data[ i ].id === articlePrevID ) {
						articlePrevURL = this.getArticleAddr( i ) ;
					}
				}

				return {
					id: articlePrevID,
					url: articlePrevURL
				};
			},

			/**
			 * Append the addPlaceholder.
			 * Placeholder is used to indicate a new post is being loaded.
			 * @return {Void}
			 */
			addPlaceholder: function() {

				var tmplPlaceholder = document.getElementById( "tmpl-placeholder" );
					 tmplPlaceholder = tmplPlaceholder.innerHTML;

					$( this.element ).append( tmplPlaceholder );
			},

			/**
			 * Detect whether the target element is visible.
			 * http://stackoverflow.com/q/123999/
			 *
			 * @return {Boolean} `true` if the element in viewport, and `false` if not.
			 */
			isVisible: function( target ) {
				if ( target instanceof jQuery ) {
					target = target[ 0 ];
				}

				var rect = target.getBoundingClientRect();

				return rect.bottom > 0 &&
					rect.right > 0 &&
					rect.left < ( window.innerWidth || document.documentElement.clientWidth ) &&
					rect.top < ( window.innerHeight || document.documentElement.clientHeight );
			},

			/**
			 * Returns a function, that, as long as it continues to be invoked, will not b
			 * triggered.
			 * The function will be called after it stops being called for N milliseconds.
			 * If immediate is passed, trigger the function on the leading edge, instead of
			 * the trailing.
			 * @param  {Function} func   	  Function to debounce
			 * @param  {Integer}  wait      The time in ms before the Function run
			 * @param  {Boolean}  immediate
			 * @return {Void}
			 */
			isDebounced: function( func, wait, immediate ) {
				var timeout;

				return function() {

					var context = this,
					args = arguments;

					var later = function() {
						timeout = null;
						if ( !immediate ) {
							func.apply( context, args );
						}
					};

					var callNow = immediate && !timeout;

					clearTimeout( timeout );
					timeout = setTimeout( later, wait );

					if ( callNow ) {
						func.apply( context, args );
					}
				};
			},

			/**
			 * Whether to proceed ( or not to ) fetching a new article.
			 * @return {Boolean} [description]
			 */
			isProceed: function() {

				if ( articleFetching || articleEnding || !this.isVisible( this.siteFloor ) ) {
					return;
				}

				if ( this.getNextArticle().id <= 0 ) {
					articleEnding = true;
					return;
				}

				return true;
			},

			/**
			 * Function to fetch and append a new article.
			 * @return {Void}
			 */
			fetch: function() {

				if ( !this.isProceed() ) {
					return;
				}

				var main = this.element;
				var $articleLast = this.getArticles().last();

				$.ajax( {
					url: this.getNextArticle().url,
					type: "GET",
					dataType: "html",
					beforeSend: function() {
						articleFetching = true;
						$( main ).addClass( function() {
							return "fetching";
						} );
					}
				} )
				.done( function( res ) {

					$articleLast
						.after( function() {
							if ( !res ) {
								return;
							}
							return $( res ).find( "#" + main.id ).html();
						} );

						window.Prism.highlightAll();
				} )
				.always( function() {
					articleFetching = false;
					$( main ).removeClass( function() {
						return "fetching";
					} );
				} );
			},

			/**
			 * Change the browser history.
			 * @return {[type]} [description]
			 */
			history: function() {

				if ( !window.History.enabled ) {
					return;
				}

				this.getArticles()
					.each( function( index, article ) {

						var scrollTop = $( window ).scrollTop();
						var articleOffset = Math.floor( article.offsetTop - scrollTop );

						if ( articleOffset > this.roofLine ) {
							return;
						}

						var floorLine = ( article.clientHeight - ( this.roofLine * 1.4 ) );
							 floorLine = Math.floor( floorLine * -1 );

						if ( articleOffset < floorLine ) {
							return;
						}

						var articleID = $( article ).data( "article-id" );
                      articleID = parseInt( articleID, 10 );

						var articleIndex;

						for ( var i = this.settings.data.length - 1; i >= 0; i-- ) {
							if ( this.settings.data[ i ].id === articleID ) {
								articleIndex = i;
							}
						}

						var articleURL = this.getArticleAddr( articleIndex );

						if ( window.location.href !== articleURL ) {
							var articleTitle = this.settings.data[ articleIndex ].title;
							window.History.pushState( null, articleTitle, articleURL );
						}

					}.bind( this ) );
			},

			/**
			 * Functions to run during the scroll.
			 * @return {[type]} [description]
			 */
			scroller: function() {

				window.addEventListener( "scroll", this.isDebounced( function() {
					this.fetch();
				}, 300 ).bind( this ), false );

				window.addEventListener( "scroll", function() {
					this.history();
				}.bind( this ), false );
			}
		} );

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {

			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );
