!function($,t,e,i){"use strict";function n(t,e){this.element=t,this.settings=$.extend({},s,e),this._defaults=s,this._name=r,this.init()}var r="keepScrolling",s={article:".article",floor:"#footer",data:null},o=!1,l=!1;$.extend(n.prototype,{init:function(){this.threshold=Math.ceil(.4*t.innerHeight),this.siteFloor=this.getSiteFloor(),this.fetch(),this.scroller(),this.placeholder()},debouncer:function(t,e,i){var n;return function(){var r=this,s=arguments,o=function(){n=null,i||t.apply(r,s)},l=i&&!n;clearTimeout(n),n=setTimeout(o,e),l&&t.apply(r,s)}},getArticles:function(){return $(this.element).find(this.settings.article)},getArticleAddr:function(e){var i=t.location.href,n=i.substr(0,i.lastIndexOf("/"));return n+"/"+this.settings.data[e].address+".html"},getNextArticle:function(){for(var t=this.getArticles().last(),e,i=t.data("article-id"),n=parseInt(i,10)-1,r=this.settings.data.length-1;r>=0;r--)this.settings.data[r].id===n&&(e=this.getArticleAddr(r));return{id:n,url:e}},getSiteFloor:function(){var t=this.settings.floor;return t.jquery?t:$(t)},placeholder:function(){var t=e.getElementById("tmpl-placeholder");t=t.innerHTML,$(main).append(t)},visible:function(i){i instanceof jQuery&&(i=i[0]);var n=i.getBoundingClientRect();return n.bottom>0&&n.right>0&&n.left<(t.innerWidth||e.documentElement.clientWidth)&&n.top<(t.innerHeight||e.documentElement.clientHeight)},proceed:function(){return o||l||!this.visible(this.siteFloor)?void 0:this.getNextArticle().id<=0?void(l=!0):!0},fetch:function(){if(this.proceed()){var e=this.element,i=this.getArticles().last();$.ajax({url:this.getNextArticle().url,type:"GET",dataType:"html",beforeSend:function(){$(e).addClass(function(){return o=!0,"fetching"})}}).done(function(n){i.after(function(){return n?$(n).find("#"+e.id).html():void 0}),t.Prism.highlightAll()}).always(function(){$(e).removeClass(function(){return o=!1,"fetching"})})}},history:function(){t.History.enabled&&this.getArticles().each(function(e,i){var n=Math.floor(i.offsetTop-$(t).scrollTop());if(!(n>this.threshold)){var r=Math.floor(-1*(i.clientHeight-1.4*this.threshold));if(!(r>n)){var s=$(i).data("article-id");s=parseInt(s,10);for(var o,l=this.settings.data.length-1;l>=0;l--)this.settings.data[l].id===s&&(o=l);var h=this.getArticleAddr(o);t.location.href!==h&&t.History.pushState(null,this.settings.data[o].title,h)}}}.bind(this))},scroller:function(){t.addEventListener("scroll",this.debouncer(function(){this.fetch()},100).bind(this),!1),t.addEventListener("scroll",function(){this.history()}.bind(this),!1)}}),$.fn[r]=function(t){return this.each(function(){$.data(this,"plugin_"+r)||$.data(this,"plugin_"+r,new n(this,t))})}}(jQuery,window,document);