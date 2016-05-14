( function( $, undefined ) {

	if ( !History.enabled ) {
		return false;
	}


	var InfiniteScroll = function Infinite() {

	}

	var api = window.SiteAPI;
	var postCount = api.postCount;
	var postList = api.posts;

	var urlBase = window.location;
		urlBase = urlBase.protocol + '//' + urlBase.host + '/';

	var $window = $( window );
	var $main = $( "#main" );
	var $footer = $( "#footer" );

	var threshold = Math.ceil( window.innerHeight * 0.4 );

	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing.
	 * 
	 * @param  {Function} func      [description]
	 * @param  {Integer}  wait      [description]
	 * @param  {Boolean}  immediate [description]
	 * @return {Function}
	 */
	function debounce( func, wait, immediate ) {

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
	};

	/**
	 * [fetchPost description]
	 * @return {[type]} [description]
	 */
	function fetchPost() {

		if ( window.postFetching || window.postEnd ) {
			return;
		}

		if ( ! $footer.visible( true ) ) {
			return;
		}

		// Get Articles.
		var $articles = $main.find( ".article" );
		
		if ( $articles.length === api.postCount ) {
			window.postEnd = true;
		}

		// Get Last Information.
		var $articleLast = $articles.last();
		var $articleData = $articleLast.data( "article" );
		var $articlePrevID = $articleData.id - 1;

		var prevAddress;

		for (var i = postList.length - 1; i >= 0; i--) {
			if ( postList[i].id === $articlePrevID ) {
				prevAddress = urlBase + postList[i].address + '.html';
			}
		};

		$.ajax( {
			url: prevAddress,
			type: 'GET',
			dataType: 'html',
			beforeSend: function() {
				window.postFetching = true;
			}
		} )
		.done( function( res ) {

			$articleLast
				.after( function() {
					
					if ( !res ) {
						return;
					}

					return $( res ).find( "#main" ).html();
				} );

				Prism.highlightAll();
		} )
		.always( function() {
			window.postFetching = false;
		} );
	}

	/**
	 * [changeHistory description]
	 * @return {[type]} [description]
	 */
	function changeHistory() {

		var $articles = $main.find( ".article" );

		$articles
			.each( function( index ) {

				var $this = $( this );
				var postID = $this.data( "article" ).id;
				var postIndex = postID - 1;

				console.log( postID, postIndex );

				var postOffset = Math.floor( this.offsetTop - $window.scrollTop() );

				if ( postOffset > threshold ) {
					return;
				}

				var postFloor = Math.floor( ( this.clientHeight - ( threshold * 1.4 ) ) * -1 );
				var postURL = urlBase + postList[ postIndex ].address + '.html';

				if ( postOffset > postFloor && window.location.href !== postURL ) {
					History.pushState( null, postList[ postIndex ].title, postURL );
				}
			} );
	}

	fetchPost();

	$window
		.on( "scroll", debounce( function() {
			fetchPost();
			changeHistory();
		}, 100 ) );

})( jQuery );