/*
 *  jquery-boilerplate - v4.0.0
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "neverEnding";
		var	baseURL = window.location.protocol + '//' + window.location.host + '/';
		var	defaults = {
				article: "article",
				floor: "#footer",
				data: null
			};

		var postFetching = false;
		var postEnding = false;

		// The actual plugin constructor
		function Plugin ( element, options ) {
			
			this.element = element;

			// jQuery has an extend method which merges the contents of two or
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
			init: function() {

				// Place initialization logic here
				// You already have access to the DOM element and
				// the options via the instance, e.g. this.element
				// and this.settings
				// you can add more functions like the one below and
				// call them like the example bellow

				this.threshold = Math.ceil( window.innerHeight * 0.4 );
				this.siteFloor = this.getSiteFloor();

				this.fetch();
				this.scroller();
			},
			debouncer: function( func, wait, immediate ) {

				var timeout;

				return function () {

					var context = this, 
					args = arguments;

					var later = function() {
						timeout = null;
						if ( !immediate ) {
							func.apply( context, args );
						};
					};

					var callNow = immediate && !timeout;

					clearTimeout( timeout );
					timeout = setTimeout( later, wait );

					if ( callNow ) { 
						func.apply( context, args );
					}
				}
			},
			getSiteAPI: function() {
				return this.settings.data;
			},
			getArticles: function() {
				return $( this.element ).find( this.settings.article );
			},
			getPostURL: function( i ) {
				return baseURL + this.getSiteAPI().posts[i].address + '.html';
			},
			getPrevArticle: function() {
				
				var $last = this.getArticles().last();

				var articlePrevAddr;
				var articlePrevID = $last.data( "article" ).id - 1; // Previous ID
				var siteAPI = this.getSiteAPI();

				for (var i = siteAPI.posts.length - 1; i >= 0; i--) {
					if ( siteAPI.posts[ i ].id === articlePrevID ) {
						articlePrevAddr = this.getPostURL( i ) ;
					}
				};

				return {
					id : articlePrevID,
					url : articlePrevAddr
				}
			},
			getSiteFloor: function() {

				var floor = this.settings.floor;

				return ( !floor.jquery ) ? $( floor ) : floor;
			},
			visible: function( target ) {

				if ( target instanceof jQuery ) {
					target = target[0];
				}

				var rect = target.getBoundingClientRect();

				return rect.bottom > 0 &&
					rect.right > 0 &&
					rect.left < (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */ &&
					rect.top < (window.innerHeight || document.documentElement.clientHeight) /*or $(window).height() */;
			},
			proceed: function() {
		
				if ( postFetching || postEnding || !this.visible( this.siteFloor ) ) {
					return;
				}

				if ( this.getPrevArticle().id <= 0 ) {
					postEnding = true;
					return;
				}

				return true;
			},
			fetch: function() {

				if ( !this.proceed() ) {
					return;
				}

				var main = this.element.id;
				var articles = this.getArticles();

				$.ajax( {
					url: this.getPrevArticle().url,
					type: 'GET',
					dataType: 'html',
					beforeSend: function() {
						postFetching = true;
					}
				} )
				.done( function( res ) {

					articles
						.last()
						.after( function() {
							if ( !res ) {
								return;
							}
							return $( res ).find( "#" + main ).html();
						} );

						Prism.highlightAll();
				} )
				.always( function() {
					postFetching = false;
				} );
			},
			history: function() {

				if ( !History.enabled ) {
					return;
				}

				var self = this;

				this.getArticles()
					.each( function( index, article ) {
					
						var articleOffset = Math.floor( article.offsetTop - $( window ).scrollTop() );

						if ( articleOffset > this.threshold ) {
							return;
						}

						var apiPosts = this.getSiteAPI().posts;
						var articleID = $( article ).data( "article" ).id;
						var articleIndex;

						for (var i = apiPosts.length - 1; i >= 0; i--) {
							if ( apiPosts[i].id === articleID ) {
								articleIndex = i;
							}
						};

						var articleFloor = Math.floor( ( article.clientHeight - ( this.threshold * 1.4 ) ) * -1 );
						var articleURL = this.getPostURL( articleIndex );

						if ( articleOffset > articleFloor && window.location.href !== articleURL ) {
							History.pushState( null, this.getSiteAPI().posts[ articleIndex ].title, articleURL );
						}

					}.bind( this ) );
			},
			scroller: function() {

				window.addEventListener( "scroll", this.debouncer( function() {
					this.fetch();
				}, 100 ).bind( this ), false );


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
					$.data( this, "plugin_" +
						pluginName, new Plugin( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );