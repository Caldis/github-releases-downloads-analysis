(this["webpackJsonpgithub-release-download-analysis"]=this["webpackJsonpgithub-release-download-analysis"]||[]).push([[0],{120:function(e,t,a){e.exports={card:"card_card__1wB1W"}},121:function(e,t,a){e.exports={github:"github_github__Qu7J7"}},13:function(e,t,a){e.exports={floatButton:"app_floatButton__TKrTn",introContainer:"app_introContainer__1hS7D",bannerContainer:"app_bannerContainer__-7zE_",contentContainer:"app_contentContainer__1t9-7",input:"app_input__2EpoL",sep:"app_sep__1pyA1",url:"app_url__2nw5t",analysis:"app_analysis__3O-9N",title:"app_title__1tfK9",versions:"app_versions__2gccw",horizontalWrapper:"app_horizontalWrapper__22__t",cardWrapper:"app_cardWrapper__1QXds",info:"app_info__3At5F",author:"app_author__2jehy",cardOverlayLeft:"app_cardOverlayLeft__Ot8ko",cardOverlayRight:"app_cardOverlayRight__1ljOg",footer:"app_footer__2vzCe"}},143:function(e,t,a){},227:function(e,t,a){"use strict";a.r(t);var n=a(0),s=a.n(n),r=a(8),i=a.n(r),c=a(26),l=a.n(c),o=a(48),d=a(61),u=a(62),h=a(68),p=a(67),j=(a(143),a(13)),b=a.n(j),f=a(92),m=a(128),v=a(119),O=a.n(v),x=a(262),g=a(260),_=a(261),y=a(51),w=a(42),N=a(71),D=a(3),S=function(e){Object(h.a)(a,e);var t=Object(p.a)(a);function a(e){var n;return Object(d.a)(this,a),(n=t.call(this,e)).componentDidUpdate=function(e){if(e.animValues!==n.props.animValues){var t=n.state.animValues;n.setState({animValues:t+n.props.animValues},n.calculate)}else n.calculate()},n.state={animValues:0},n.onScrollStart=n.onScrollStart.bind(Object(w.a)(n)),n.resetMin=n.resetMin.bind(Object(w.a)(n)),n.resetMax=n.resetMax.bind(Object(w.a)(n)),n}return Object(u.a)(a,[{key:"componentDidMount",value:function(){if(this.props.pageLock){var e=document.firstElementChild.className;document.firstElementChild.className=e+(e?" ":"")+"locked__"}i.a.findDOMNode(this.hScrollParent).addEventListener("wheel",this.onScrollStart,{passive:!1})}},{key:"componentWillUnmount",value:function(){this.props.pageLock&&(document.firstElementChild.className=document.firstElementChild.className.replace(/ ?locked__/,"")),i.a.findDOMNode(this.hScrollParent).removeEventListener("wheel",this.onScrollStart)}},{key:"onScrollStart",value:function(e){var t=this;e.preventDefault();var a=e.deltaY?e.deltaY:e.deltaX,n=Math.floor(a),s=this.state.animValues,r=s+n,i=s-n;if(this.caniscroll()){window.requestAnimationFrame((function(){t.props.reverseScroll?t.setState({animValues:i}):t.setState({animValues:r})}))}}},{key:"shouldComponentUpdate",value:function(e,t,a){return(void 0===this.calculate.timer||this.props.children!==e.children||this.state.animValues!==t.animValues||this.props.animValues!==e.animValues)&&(this.props.children!==e.children||!1!==this.caniscroll())}},{key:"caniscroll",value:function(){var e=i.a.findDOMNode(this.hScrollParent),t=e.getBoundingClientRect(),a=e.firstElementChild;return a.offsetLeft<t.left||a.offsetLeft+a.offsetWidth>t.width}},{key:"calculate",value:function(){var e=this;clearTimeout(this.calculate.timer),this.calculate.timer=setTimeout((function(){var t=i.a.findDOMNode(e.hScrollParent),a=t.getBoundingClientRect(),n=t.lastElementChild.scrollWidth,s=t.offsetWidth,r=e.state.animValues,c=-(n-s);if(r>=1)e.resetMin();else if(r<=c)if(n>a.width){var l=c+1;e.resetMax(l)}else e.resetMax(0)}))}},{key:"resetMin",value:function(){this.setState({animValues:0})}},{key:"resetMax",value:function(e){this.setState({animValues:e})}},{key:"render",value:function(){var e=this,t=this.props,a=t.config,n=t.style,s=t.children,r=n.width,i=n.height,c=a||N.presets.noWobble,l=Object(y.a)({height:i||"100%",width:r||"100%",overflow:"hidden",position:"relative"},n);return Object(D.jsx)("div",{ref:function(t){e.hScrollParent=t},style:l,className:"scroll-horizontal ".concat(this.props.className||""),children:Object(D.jsx)(N.Motion,{style:{z:Object(N.spring)(this.state.animValues,c)},children:function(e){var t=e.z,a={transform:"translate3d(".concat(t,"px, 0,0)"),display:"inline-flex",height:"100%",position:"absolute",willChange:"transform"};return Object(D.jsx)("div",{style:a,children:s})}})})}}]),a}(n.Component);S.defaultProps={reverseScroll:!1,pageLock:!1,config:null,style:{width:"100%",height:"100%"},className:null,animValues:null};var C=a(129),M=a(120),k=a.n(M),V=function(e){var t=e.className,a=e.children,n=Object(C.a)(e,["className","children"]);return Object(D.jsx)("div",Object(y.a)(Object(y.a)({className:"".concat(k.a.card," ").concat(t||"")},n),{},{children:a}))},E=a(52),L=a.n(E),R=function(e){var t=e.title,a=e.data,n=e.tail;return Object(D.jsxs)("div",{children:[Object(D.jsx)("span",{className:L.a.title,children:t}),Object(D.jsxs)("div",{className:L.a.content,children:[Object(D.jsx)("h2",{className:L.a.data,children:a}),Object(D.jsx)("span",{className:L.a.tail,children:n})]})]})},A=a(65),W=function(e,t){return{color:["#193568"],tooltip:{trigger:"axis",formatter:"{a} <br/>Version {b}: {c} times",axisPointer:{type:"shadow"}},grid:{top:0,left:-40,right:0,bottom:0,containLabel:!0},xAxis:[{type:"category",data:t,axisLine:{lineStyle:{color:"#999999"}},axisTick:{alignWithLabel:!0},axisLabel:{}}],yAxis:[{show:!1,type:"value",axisLine:{show:!1,lineStyle:{color:"#999999"}}}],series:[{name:"Download Count",type:"bar",barWidth:"80%",data:e}]}},P=function(e){var t=e.data,a=e.tag;return Object(D.jsx)(A.a,{option:W(t,a),notMerge:!0,lazyUpdate:!0})},T=function(e){return{color:["#193568","#176297","#93b7e3"],tooltip:{trigger:"item",formatter:"{a} <br/>Version {b}: {c} times ({d}%)"},series:[{name:"Download Ratio",type:"pie",radius:[20,110],center:["50%","50%"],roseType:"radius",grid:{top:0,left:0,right:0,bottom:0,containLabel:!0},data:e.sort((function(e,t){return e.value-t.value})),animationType:"scale",animationEasing:"elasticOut",animationDelay:function(e){return 200*Math.random()}}]}},z=function(e){var t=e.data;return Object(D.jsx)(A.a,{option:T(t),notMerge:!0,lazyUpdate:!0})},I=a(121),U=a.n(I),B=a(256),G=function(e){return Object(D.jsx)("a",{className:U.a.github,href:"https://github.com/Caldis/github-releases-downloads-analysis",children:Object(D.jsx)(B.a,{"aria-label":"Github",children:Object(D.jsx)("svg",{focusable:"false",viewBox:"0 0 24 24","aria-hidden":"true",children:Object(D.jsx)("path",{d:"M12.007 0C6.12 0 1.1 4.27.157 10.08c-.944 5.813 2.468 11.45 8.054 13.312.19.064.397.033.555-.084.16-.117.25-.304.244-.5v-2.042c-3.33.735-4.037-1.56-4.037-1.56-.22-.726-.694-1.35-1.334-1.756-1.096-.75.074-.735.074-.735.773.103 1.454.557 1.846 1.23.694 1.21 2.23 1.638 3.45.96.056-.61.327-1.178.766-1.605-2.67-.3-5.462-1.335-5.462-6.002-.02-1.193.42-2.35 1.23-3.226-.327-1.015-.27-2.116.166-3.09 0 0 1.006-.33 3.3 1.23 1.966-.538 4.04-.538 6.003 0 2.295-1.5 3.3-1.23 3.3-1.23.445 1.006.49 2.144.12 3.18.81.877 1.25 2.033 1.23 3.226 0 4.607-2.805 5.627-5.476 5.927.578.583.88 1.386.825 2.206v3.29c-.005.2.092.393.26.507.164.115.377.14.565.063 5.568-1.88 8.956-7.514 8.007-13.313C22.892 4.267 17.884.007 12.008 0z"})})})})};Date.prototype.Format=function(e){var t={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var a in/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),t)new RegExp("("+a+")").test(e)&&(e=e.replace(RegExp.$1,1===RegExp.$1.length?t[a]:("00"+t[a]).substr((""+t[a]).length)));return e},Array.prototype.Remove=function(e){var t=this.indexOf(e);return t>-1?this.slice(0,t).concat(this.slice(t+1,this.length)):this};var F=a(127),$=a.n(F),J=function(){var e=Object(o.a)(l.a.mark((function e(t,a){var n;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n="https://api.github.com/repos/".concat(t,"/").concat(a,"/releases"),e.abrupt("return",$.a.get(n));case 2:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),Q=Object(m.a)(),Y=function(e){Object(h.a)(a,e);var t=Object(p.a)(a);function a(e){var n;Object(d.a)(this,a),(n=t.call(this,e)).handleGetUserInput=Object(o.a)(l.a.mark((function e(){var t,a,s,r,i,c,o;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=n.state,a=t.url,s=t.user,r=t.repo,!a){e.next=10;break}return o=a.split("/"),i=o[o.length-2],c=o[o.length-1],e.next=7,n.handleGetReleaseData(i,c);case 7:Q.push(a?"/?url=".concat(a):"/?user=".concat(s,"&repo=").concat(r)),e.next=19;break;case 10:if(!s||!r){e.next=18;break}return i=s,c=r,e.next=15,n.handleGetReleaseData(i,c);case 15:Q.push(a?"/?url=".concat(a):"/?user=".concat(s,"&repo=").concat(r)),e.next=19;break;case 18:n.setState({err:"No user data input"});case 19:case"end":return e.stop()}}),e)}))),n.handleGetReleaseData=function(){var e=Object(o.a)(l.a.mark((function e(t,a){var s,r,i,c,o,d,u;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,J(t,a);case 2:(s=e.sent).data.length>0?(r=s.data.sort((function(e,t){return e.created_at===t.created_at?0:e.created_at<t.created_at?1:-1})),i=new Date(r[r.length-1].created_at).Format("yyyy-MM-dd hh:mm:ss"),c=r.reduce((function(e,t){return e+n.downloadOfAssets(t.assets)}),0),o=r.map((function(e){return e.tag_name})),d=r.map((function(e){return n.downloadOfAssets(e.assets)})),u=r.map((function(e){return{value:n.downloadOfAssets(e.assets),name:e.tag_name}})),n.setState({showInput:!0,showAnalysis:!0,user:t,repo:a,data:r,since:i,totalDownload:c,trendTag:o,trendData:d,distData:u})):n.setState({err:"No release"});case 4:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),n.downloadOfAssets=function(e){return e.reduce((function(e,t){return e+t.download_count}),0)},n.buildVersionCards=function(){return n.state.data.sort((function(e,t){return e.tag_name===t.tag_name?0:e.tag_name<t.tag_name?1:-1})).map((function(e,t){return Object(D.jsxs)(V,{children:[Object(D.jsxs)("div",{className:b.a.title,children:[Object(D.jsx)("h2",{children:e.tag_name}),Object(D.jsx)("a",{href:e.html_url,children:"Detail >"})]}),Object(D.jsxs)("div",{className:b.a.info,children:[Object(D.jsxs)("p",{children:["Create at: ",new Date(e.created_at).Format("yyyy-MM-dd hh:mm:ss")]}),Object(D.jsxs)("p",{children:["Publish at: ",new Date(e.published_at).Format("yyyy-MM-dd hh:mm:ss")]})]}),Object(D.jsxs)("div",{className:b.a.author,children:[Object(D.jsx)(x.a,{alt:e.author.login,src:e.author.avatar_url}),Object(D.jsx)("a",{href:e.author.html_url,children:e.author.login})]})]},t)}))};var s=O.a.parse(Q.location.search);return n.state={showInput:!1,showAnalysis:!1,err:"",url:s.url||"",user:s.user||"",repo:s.repo||"",data:[],since:"",totalDownload:0,trendTag:[],trendData:[],distData:[]},window.addEventListener("dragover",(function(e){e.preventDefault()}),!1),window.addEventListener("drop",(function(e){e.preventDefault()}),!1),n.handleGetUserInput(),n}return Object(u.a)(a,[{key:"render",value:function(){var e=this,t=this.state,a=t.showInput,n=t.showAnalysis,s=t.url,r=t.user,i=t.repo,c=t.data,l=t.since,o=t.totalDownload,d=t.trendTag,u=t.trendData,h=t.distData;return Object(D.jsxs)("div",{className:b.a.app,children:[Object(D.jsx)("div",{className:b.a.floatButton,children:Object(D.jsx)(G,{})}),Object(D.jsx)(f.a,{className:b.a.bannerContainer,type:"bottom",duration:[350,0],children:a?Object(D.jsxs)("div",{className:b.a.input,children:[Object(D.jsx)("p",{children:"Input the target"}),Object(D.jsxs)("div",{className:b.a.sep,children:[Object(D.jsx)(_.a,{label:"USER",style:{width:"50%"},value:r,onChange:function(t){return e.setState({user:t.target.value})}}),Object(D.jsx)(_.a,{label:"REPO",style:{width:"50%"},value:i,onChange:function(t){return e.setState({repo:t.target.value})}})]}),Object(D.jsx)("p",{children:"Or url of repo"}),Object(D.jsx)("div",{className:b.a.url,children:Object(D.jsx)(_.a,{label:"URL",style:{width:"100%"},value:s,onChange:function(t){return e.setState({url:t.target.value})}})}),Object(D.jsx)("p",{children:"Then"}),Object(D.jsx)(g.a,{variant:"contained",color:"primary",onClick:this.handleGetUserInput,children:"Analysis"})]},2):Object(D.jsxs)("div",{className:b.a.introContainer,children:[Object(D.jsx)("h1",{children:"Analysis your repo's releases state on Github"}),Object(D.jsx)("div",{children:Object(D.jsx)(g.a,{variant:"contained",color:"primary",onClick:function(){return e.setState({showInput:!0})},children:"Start"})})]},1)}),Object(D.jsx)(f.a,{className:b.a.contentContainer,type:"bottom",children:n&&Object(D.jsxs)("div",{children:[Object(D.jsxs)(V,{className:b.a.analysis,children:[Object(D.jsx)("section",{children:Object(D.jsxs)("h1",{className:b.a.title,children:["Project ",i]})}),Object(D.jsxs)("section",{children:[Object(D.jsx)("h1",{children:"Total Download"}),Object(D.jsx)(R,{title:"Since ".concat(l),data:o,tail:"times"})]}),Object(D.jsxs)("section",{children:[Object(D.jsx)("h1",{children:"Download Trend"}),Object(D.jsx)(P,{tag:d,data:u})]}),Object(D.jsxs)("section",{children:[Object(D.jsx)("h1",{children:"Download Distribution of Versions"}),Object(D.jsx)(z,{data:h})]})]}),Object(D.jsxs)("div",{className:b.a.versions,children:[Object(D.jsx)("p",{children:"Versions Info"}),Object(D.jsx)("div",{className:b.a.horizontalWrapper,children:c.length>0&&Object(D.jsx)(S,{style:{height:230},children:Object(D.jsx)("div",{className:b.a.cardWrapper,children:this.buildVersionCards()})})}),Object(D.jsx)("div",{className:b.a.cardOverlayLeft}),Object(D.jsx)("div",{className:b.a.cardOverlayRight})]}),Object(D.jsxs)("div",{className:b.a.footer,children:[Object(D.jsx)("p",{children:"Designed & Made by Caldis, Power by React"}),Object(D.jsx)(G,{})]})]},1)})]})}}]),a}(s.a.Component);i.a.render(Object(D.jsx)(Y,{}),document.getElementById("root"))},52:function(e,t,a){e.exports={title:"tags_title__1k3Qx",content:"tags_content__32PAx",data:"tags_data__2LCtD",tail:"tags_tail__242Px"}}},[[227,1,2]]]);
//# sourceMappingURL=main.fdd3fa0b.chunk.js.map