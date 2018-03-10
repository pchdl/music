var audio = document.getElementById('audio'),
	list = document.getElementById('list'),
	lrc = document.getElementById('lrc'),
	musiclist = document.getElementById('musiclist'),
	lrcbox = document.getElementById('lrcbox'),
    play = document.getElementById('play'),
    prev = document.getElementById('prev'),
    next = document.getElementById('next'),
    title = document.getElementById('title'),
    singer = document.getElementById('singer'),
    musicimg = document.getElementById('musicimg'),
    timebtn = document.getElementById('timebtn'),
    totaltime = document.getElementById('totaltime'),
    curtime = document.getElementById('curtime'),
    already = document.getElementById('already'),
    speek = document.getElementById('speek'),
    fovol = document.getElementById('fovol'),
    volbtn = document.getElementById('volbtn'),
    msg = document.getElementById('msg'),
    flag=true;//拖动播放进度滑块时设置false关闭默认监听移动

var n,vol;//记录当前歌曲序号+音量

//加载播放列表
~function loadmusic(){
	var len = music.length;
	var listbox = '<ul>'
	for (var i=0;i<len; i++) {
		listbox += '<li class="ml">'+music[i].singer+' - '+music[i].title+'</li>';
	}
	listbox += '</ul>';
	musiclist.innerHTML = listbox;
	//默认加载第一首
	n=0;
	uselrc(n);
	var v = window.localStorage.getItem('volunm');//本地存储中获取音量
	if(v==null || v>1 || v<0 || isNaN(v)){//音量数值在0-1之间
		vol = 0.5;//设置默认音量为50%；
		window.localStorage.setItem('volunm',vol);//保存音量
	}else{
		vol = v;
		if(v==0){
			speek.style.background = 'url(img/nospeek.png) no-repeat';
			speek.style.backgroundSize = '100% 100%';
		}
	};
	audio.setAttribute('src',music[0].file); //插入音乐路径
	msg.innerHTML = '正在加载..';
	audio.volume = vol; //设置音量
	musicimg.style.background = 'url('+music[0].img+') no-repeat'; //设置头像
	title.innerHTML = music[0].title; //写入歌名
	singer.innerHTML = music[0].singer; //写入歌手
	document.querySelector('.ml').classList.add('on'); //激活列表第一首
	audio.pause();//默认不播放
	timecontrl(); //加载歌时间轴
}();

//点击music列表播放
var mc = musiclist.children[0].children;
for(var i=0;i<mc.length;i++){
	mc[i].ind = i;
	mc[i].src = music[i].file;
	mc[i].title = music[i].title;
	mc[i].singer = music[i].singer;
	mc[i].img = music[i].img;
	mc[i].addEventListener('click', function(){
		n = this.ind;
		uselrc(n);
		clickplay(this);
	}) 
}

function clickplay(obj){
	msg.innerHTML = '正在加载..';
	if(document.querySelector('.on')){
		document.querySelector('.on').classList.remove('on');
	}
	audio.setAttribute('src',obj.src);
	title.innerHTML = obj.title;
	singer.innerHTML = obj.singer;
	musicimg.style.background = 'url('+obj.img+') no-repeat';
	musicimg.classList.add('rotate');
	obj.classList.add('on');
	play.style.background = 'url(img/pause.png) no-repeat';
	play.style.backgroundSize = '100% 100%';
	audio.load(function(){//注意，要加载好才能播放，否则切歌会出现报错	
		audio.play();
		timecontrl();
	})	
}


//点击播放按钮
play.onclick = function(){
	playorpause();
}

function playorpause(){
	if(!audio.paused){//正在播放则暂停
		play.style.background = 'url(img/play.png) no-repeat';
		play.style.backgroundSize = '100% 100%';
		audio.pause();
		musicimg.classList.remove('rotate');
	}else{//暂停中则继续播放
		play.style.background = 'url(img/pause.png) no-repeat';
		play.style.backgroundSize = '100% 100%';
		audio.play();
		musicimg.classList.add('rotate');
	}
}



//展开和收缩music列表
list.onclick = function(){
	if(musiclist.className.indexOf(' showlist')>-1){
		musiclist.classList.remove('showlist');
	}else{
		musiclist.classList.add('showlist');
	}
}
lrc.onclick = function(){
	if(lrcbox.className.indexOf(' showlrc')>-1){
		lrcbox.classList.remove('showlrc');
	}else{
		lrcbox.classList.add('showlrc');
	}
}

//点击上一首
prev.onclick = function(){
	n===0?n=mc.length-1:n--;
	uselrc(n);
	clickplay(mc[n]);
}
//下一首
next.onclick = function(){
	n===mc.length-1?n=0:n++;
	uselrc(n);
	clickplay(mc[n]);
}

	
//时间进度与控制====监听事件
var timeline = document.getElementById('timeline').clientWidth;
function timecontrl(){
	audio.addEventListener('canplay',function(){//加载音乐成功才能获取时间秒数
		totaltime.innerHTML = ctime(audio.duration);//写入总时间
		curtime.innerHTML = ctime(audio.currentTime);//写入当前已播放时间
		msg.innerHTML = '';		
	});
	audio.addEventListener('timeupdate',function(){//监听播放时间是否改变
		curtime.innerHTML = ctime(audio.currentTime);//实时更新播放时间
		if(flag==true){
			timebtn.style.left = already.style.width = audio.currentTime/audio.duration*timeline+'px';//时间轴更新
		}		
	});
	audio.addEventListener('ended', function () { //监听本曲播放完毕自动播放下一首
		scrollerlrc.style.top = '0px';
		n++;
     	if(n===mc.length)n=0;
     	uselrc(n);
	    clickplay(mc[n]);
    });	
}


//拖动播放进度滑块
timebtn.onmousedown = function(e){
	var e = e || event;
	var x0 = e.clientX;
	var left0 = timebtn.offsetLeft;
	document.onmousemove=function(e){
		flag = false;
		var e= e||event;
		var x1 = e.clientX;
		var mx = left0+(x1-x0)+4;
		if(mx<0)mx=0;
		if(mx>timeline)mx = timeline;
		timebtn.style.left = mx+'px';
		//改变时间
		curtime.innerHTML = ctime(mx/timeline*audio.duration);
		return false;
	}
	document.onmouseup = function(e){
		var e= e||event;
		var x1 = e.clientX;
		var mx = left0+(x1-x0)+4;
		
		//跳到拖到的点开始播放
		toplay(mx);
		this.onmousemove = null;
		this.onmouseup = null;
	}
}

//跳到某时间点播放
function toplay(mx){
	uselrc();
	if(mx<0)mx=0;
	if(mx>timeline)mx=timeline;
	var cur = mx/timeline*audio.duration;
	if(cur>=audio.duration)cur=audio.duration;
	audio.currentTime = cur;
	play.style.background = 'url(img/pause.png) no-repeat';
	play.style.backgroundSize = '100% 100%';
	audio.play();
	musicimg.classList.add('rotate');
	flag = true;
}

//时间转换
function ctime(sec){
	//鉴于一般歌曲都是几分钟，这里没有做小时的转换
	var m = Math.floor(sec/60)<10?'0'+Math.floor(sec/60):Math.floor(sec/60)+'';
	var s = Math.floor(sec-Math.floor(sec/60)*60)<10?'0'+Math.floor(sec-Math.floor(sec/60)*60):Math.floor(sec-Math.floor(sec/60)*60)+'';
	return m+':'+s;
}

//加载已保存的音量
var volbox = document.querySelector('.volbox');
var volline = document.getElementById('volline').clientHeight;
// volbtn.style.top  = 106 - 50 +'px';
// fovol.style.height = 50 +'px';
volbtn.style.top = 100-vol*100+4+'px';
fovol.style.height = vol*100+'px';

speek.onclick = function(){
	if(document.querySelector('.show')){
		
		volbox.classList.remove('show');
	}else{
		volbox.classList.add('show');
	}
}
document.onclick = function(e){
	var e = e || event;
	var cn = e.target.className;
	if(cn!='volline' && cn!='fovol' && cn!='volbtn' && cn!='volbox show' && cn!='speek'){
		volbox.classList.remove('show');
	};
}

//音量控制 0-1
volbtn.onmousedown = function(e){
	var e = e || event;
	var y0 = e.clientY;
	var bto0 = this.offsetTop;
	document.onmousemove = function(e){
		var e = e || event;
		var y1 = e.clientY;
		var wy = bto0 + (y1-y0);
		if(wy<6)wy=6;
		if(wy>106)wy=106;
		volbtn.style.top = wy + 'px';
		fovol.style.height = 100-wy+6+'px';
		//改变音量
		audio.volume = (100-wy+6)/100;
		//保存音量本地存储
		window.localStorage.setItem('volunm',(100-wy+6)/100);

		if((100-wy+6)/100<=0){
			speek.style.background = 'url(img/nospeek.png) no-repeat';
			speek.style.backgroundSize = '100% 100%';
		}else{
			speek.style.background = 'url(img/speek.png) no-repeat';
			speek.style.backgroundSize = '100% 100%';
		}
		return false;
	}
	document.onmouseup = function(e){
		this.onmousemove = null;
		this.onmouseup = null;
	}
}

//键盘上下键控制音量
//var volstep = 0.1; //设置每次按键一次增加或减少的音量
document.onkeyup = function(e){
	var key = e.which || e.keyCode;
	var vbtn = volbtn.offsetTop;//初始位置
	if(key==32){//空格暂停/播放
		playorpause();
	}
	if(key==38){//声音增大0.1
		setvol(0.1,vbtn);
	}
	if(key==40){//声音减小0.1
		setvol(-0.1,vbtn);	
	}
	var tbtnleft = timebtn.offsetLeft;
	if(key==37){//后退10秒
		setpro(-10,tbtnleft);
	}
	if(key==39){//快进10秒
		setpro(10,tbtnleft);	
	}
}
//左右键控制播放进度(后退与快进)；
function setpro(s,left){
	flag = false;
	var tot = audio.duration;
	var to = audio.currentTime+s;
	if(to>tot)to=tot;
	if(to<0)to=0;
	toplay(to/tot*timeline);
}
//控制音量
function setvol(volstep,vbtn){
	vol += volstep;
	var ll = vbtn-volstep*100;
	if(ll<6)ll=6;
	if(ll>106)ll=106;
	audio.volume = (100-ll+6)/100;
	volbtn.style.top = ll + 'px';
	fovol.style.height = 100-ll+6+'px';
	window.localStorage.setItem('volunm',(100-ll+6)/100);
	if((100-ll+6)/100<=0){
		speek.style.background = 'url(img/nospeek.png) no-repeat';
		speek.style.backgroundSize = '100% 100%';
	}else{
		speek.style.background = 'url(img/speek.png) no-repeat';
		speek.style.backgroundSize = '100% 100%';
	}

}

//歌词同步
var scrollerlrc = document.getElementById('scrollerlrc');
function uselrc(){
	$.ajax({
		type:'get',
		url:music[n].lrc,
		dataType:'text',
		success:function(res){
			var ary = res.split('[');
			var html = '';
			for(var i=0;i<ary.length;i++){
				if(ary[i]){
					var sp = ary[i].split(']');
					var tim = sp[0].split('.')[0].split(':');
					var ss = tim[0]*60+tim[1]*1;
					html += '<p id="lrc'+ss+'">'+sp[1]+'</p>' 
				}
			}
			scrollerlrc.innerHTML = html;//加载歌词

			var allp = scrollerlrc.children;
			var top = scrollerlrc.style.top;
			var line = 0;
			audio.addEventListener('timeupdate',function(){//监听在播放
				var curtime = parseInt(this.currentTime);//获取当前已播放的整数秒
				if(document.getElementById('lrc'+curtime)){
					if(document.querySelector('.onfocus')){//如果存在则清楚上一句样式
						document.querySelector('.onfocus').classList.remove('onfocus');
					}
					document.getElementById('lrc'+curtime).classList.add('onfocus');
					//歌词滚动（设置第8行开始）
					if(allp[line+10] && allp[line+10].id == 'lrc'+curtime){
						scrollerlrc.style.top = -line*23 +'px';
						line++;
					}
				}
			});
		}
	})
};

