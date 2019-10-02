//var poem = ["白日依山尽","黄河入海流","欲穷千里目","更上一层楼"];
//var title = "登鹳雀楼"
//var author = "王之涣"
var author=""
var title=""
var poem=[]

var HANZI_SIZE = 80;
const NUM_DIRECT = 8;
const ShowEnum = Object.freeze({"PINYIN":1, "SIMPLE":2, "TRADITIONAL":3});
var grid_num = 0;
var allHanzi = [];
var allText = [];
var selected = [];
var selected_dir = {x:0,y:0}
var next_check = 0;
var last_input_pos = {x:-1,y:-1};
var is_gameover = false;
var is_traditional = false;
var LEVEL = 0;

document.getElementById("start").addEventListener("click", newGame);
document.getElementById("again").addEventListener("click", startGame);
document.getElementById("simple").addEventListener("click", toggleTraditional);


function toggleTraditional()
{
	is_traditional = !is_traditional;
	document.getElementById("simple").innerHTML = is_traditional ? '繁' : '简';
	for(var i = 0; i < allHanzi.length; ++i)
	{
		allHanzi[i].toggleTraditional(is_traditional);
	}
	
	for(var i = 0; i < allText.length; ++i)
	{
		allText[i].toggleTraditional(is_traditional);
	}
}

function newGame() {
   var idx = Math.floor(Math.random() * AllPoems.poems.length);
   var data = AllPoems.poems[idx];
   poem = data.content;
   title = data.title;
   author = data.author;
   
   /*
   // image
   var image_path = sessionStorage.getItem("image_path");
   var img = document.getElementById("img");
   img.setAttribute("src", image_path);
   
   //audio
   var audio_path = sessionStorage.audio_path;
   if(audio_path){
		poemAudio.start(audio_path);
   }
	*/
   grid_num = 0;
   for(var i=0; i<poem.length; ++i)
   {
	  if(poem[i].length + 2 > grid_num)
		grid_num = poem[i].length + 2;
   }
   if(poem.length > grid_num)
		grid_num = poem.length;
	
   Reset();		
   myPoemArea.start(title, author, poem);
   myGameArea.start();
}

function startGame(){
	Reset();
	myPoemArea.update();
	createPoem(poem);
	createOther(LEVEL);
	stopWatch.start(100); //in ms: random_interval=Math.floor(Math.random() * 23) + 61
}

function Reset(){
	allHanzi = [];
	selected = [];
	selected_dir = {x:0,y:0}
	next_check = 0;
	last_input_pos = {x:-1,y:-1};
	is_gameover = false;
	stopWatch.stop();
}

function numberWithLeadingZero(num, m){
	return String(num).padStart(m, "0");
}

function showHtmlElementById(id, show=true) {
  var x = document.getElementById(id);
  showHtmlElement(x, show);
}

function showHtmlElement(elem, show=true) {
  if(show)
	elem.style.display = "block";
  else
	elem.style.display = "none";
}

function parseElapsedTime(elapsed){
	var minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
	var milliseconds = Math.floor(elapsed % 1000);
	return numberWithLeadingZero(minutes,2) + ":" + numberWithLeadingZero(seconds,2) + "." + numberWithLeadingZero(milliseconds, 3);
}

function RemoveAllChild(elem){
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
  }
}

var poemAudio = {
	play_butn : document.getElementById("audioButn"),
	is_playing : false,
	
	start : function(audio_path){
		if(audio_path)
		{
			showHtmlElement(this.play_butn, true);
			this.audio = new Audio(audio_path);
			
			this.play_butn.onclick = (function(){
				this.is_playing = !this.is_playing;
				if(this.is_playing)
					this.audio.play();
				else
					this.audio.pause();
			}).bind(this);
		}
		else
		{
			showHtmlElement(this.play_butn, false);
		}
	}
}


var stopWatch = {
	shortest_time : Number.NaN,
	elapsed_time : Number.NaN,
	start_time : Number.NaN,
	is_running : false,
	
	start : function(interval){		
		if(this.is_running) return;
		
		this.interval = interval;
		this.is_running = true;
		this.start_time = Number.NaN;
		this.last_tick = 0;
		window.requestAnimationFrame(onFrame);
	},
	
	onTick : function(now){
		if( Number.isNaN(this.start_time) )
			this.start_time = now;
		
		if(now - this.last_tick >= this.interval)
		{
			this.last_tick = now;
			this.elapsed_time = now - this.start_time;
			document.getElementById("curtime").innerHTML = parseElapsedTime(this.elapsed_time);			
		}
		
		if(this.is_running)
			window.requestAnimationFrame(onFrame);
	},
	
	stop : function(){
		if(!this.is_running) return;
		
		this.is_running = false;
		if(is_gameover && !Number.isNaN(this.elapsed_time) && (Number.isNaN(this.shortest_time) || this.elapsed_time < this.shortest_time))
		{
			this.shortest_time = this.elapsed_time;
			document.getElementById("besttime").innerHTML = parseElapsedTime(this.shortest_time);
		}
	},	
}


function onFrame(now) {
	stopWatch.onTick(now);
}

var myPoemArea = {
	myPoem : document.getElementById("poem"),
	myTitle : document.getElementById("title"),

	update : function(){
		for(var i=0; i<this.myPoem.childElementCount; i++)
		{
			showHtmlElement(this.myPoem.childNodes[i], i < next_check);
		}
		showHtmlElement(this.myPoem, next_check > 0);
	},
	start :  function(title, author, poem)	{
		RemoveAllChild(this.myTitle);
		RemoveAllChild(this.myPoem);
		this.myTitle.append(CreateTextComponent("H1", title));
		this.myTitle.append(CreateTextComponent("H3", author));
		for(var i=0; i<poem.length; i++)
			this.myPoem.append(CreateTextComponent("H2", poem[i]));
			
		this.update();		
	}	
}

function CreateTextComponent(tag, text){
	var node = document.createElement(tag);
	allText.push(new TextComponent(text, is_traditional));
	node.append(allText[allText.length-1].node);
	node.style.fontFamily = "KaiTi";
	node.style.opacity = 1;	// not inherit opacity from parent
	return node;
}

function TextComponent(text, show_traditional){
	this.show_traditional = show_traditional;
	this.simple = text;
	this.tradtional = Simple2Traditional(text);
	this.node = document.createTextNode(text);	
	
	this.updateText = function(){
		if(this.show_traditional)
			this.node.nodeValue = this.tradtional;
		else
			this.node.nodeValue = this.simple;
	}
	this.updateText();
	
	this.toggleTraditional = function(show_traditional){
		this.show_traditional = show_traditional;
		this.updateText();
	}	
}
	

var myGameArea = {
  canvas : document.getElementById("grid"),
  game_area : document.getElementById("game area"),
  start : function() {
	// browser inner size
	//var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	//var h = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
	var size = this.game_area.offsetWidth;
	HANZI_SIZE = Math.floor(size / grid_num) + 1;	
    this.canvas.width = size;
    this.canvas.height = size;
	
    this.context = this.canvas.getContext("2d");
    this.interval = setInterval(updateGameArea, 20);
	this.tracking = false;
	this.mouseDownPos = {x:-1, y:-1};
	
	this.canvas.addEventListener('touchmove', function (e) {
	  var rect = myGameArea.canvas.getBoundingClientRect();
	  checkGameOver(e.touches[0].clientX-rect.left, e.touches[0].clientY-rect.top);
	  myGameArea.hasMoved = myGameArea.tracking;
	})
	this.canvas.addEventListener('mousemove', function (e) {
	  checkGameOver(e.offsetX, e.offsetY);
    })
    this.canvas.addEventListener('mousedown', function (e) {
	  myGameArea.tracking = true;
	  myGameArea.mouseDownPos = {x:e.offsetX, y:e.offsetY};	  
    })
    this.canvas.addEventListener('mouseup', function (e) {
	  checkGameOver(false, false);
	  myGameArea.tracking = false;
    })
    window.addEventListener('mouseup', function (e) {
	  checkGameOver(false, false);
	  myGameArea.tracking = false;
    })	
    this.canvas.addEventListener('touchstart', function (e) {
	  myGameArea.tracking = true;
	  //checkGameOver(e.clientX, e.clientY);
    })
    this.canvas.addEventListener('touchend', function (e) {
	  checkGameOver(false, false);
	  myGameArea.tracking = false;
    })
    window.addEventListener('touchend', function (e) {
	  checkGameOver(false, false);
	  myGameArea.tracking = false;
    })	
	this.canvas.addEventListener('click', function (e) {
		// only check when just click but not mousedown->mousemove->mouseup->click
	  if(distance(e.offsetX, e.offsetY, myGameArea.mouseDownPos.x, myGameArea.mouseDownPos.y) < HANZI_SIZE/2)
		checkPinyinShow(e.offsetX, e.offsetY);
    })
	
	window.addEventListener('resize', function(e){
		var size = myGameArea.game_area.offsetWidth;
		HANZI_SIZE = Math.floor(size / grid_num) + 1;	
		myGameArea.canvas.width = size;
		myGameArea.canvas.height = size;
		for(i=0; i<allHanzi.length; ++i)
			allHanzi[i].resize();
		updateGameArea();
		//console.log("RESIZE", HANZI_SIZE, myGameArea.canvas.width, myGameArea.canvas.height)
	});	
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }, 
  update : function(){
	this.context.lineWidth = 5;
	this.context.strokeStyle = "#FF0000";
	this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
}


function updateGameArea() {
    myGameArea.clear();	
	
	for(i=0; i<allHanzi.length; ++i)
		allHanzi[i].update();
		
	myGameArea.update();
}

function checkPinyinShow(x, y)
{
	for(var i = 0; i < allHanzi.length; ++i)
	{
		if(allHanzi[i].isTouched(x,y))
		{
			allHanzi[i].togglePinyin();
			return;
		}
	}
}

function distance(x1, y1, x2, y2)
{
	return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function checkGameOver(x, y)
{
	if(is_gameover) return;
	if(!myGameArea.tracking)
	{
		last_input_pos = {x:-HANZI_SIZE,y:-HANZI_SIZE};
		return;
	}
	if (x && y) 
	{
		// check and update selection
		  var rect = myGameArea.canvas.getBoundingClientRect();
		  if(x > 0 && x < rect.width && y > 0 && y < rect.height && 
			 distance(x, y, last_input_pos.x, last_input_pos.y) > HANZI_SIZE/2)
		  {
			 updateSelection(x, y);
			 last_input_pos.x = x;
			 last_input_pos.y = y;
		  }		  
	}else
	{
		// check and clear selection
		passed = checkSelection();
		if(passed)
		{
			//TODO: show poem
			next_check++;
			myPoemArea.update();
			if(next_check==poem.length)
			{
				gameOver();
			}
		}
	}
}

function gameOver()
{
	for(var i=0; i<allHanzi.length; ++i)
	{
		if(!allHanzi[i].is_highlight)
			allHanzi[i].frozen();
	}
	is_gameover = true;
	stopWatch.stop();
}

function updateSelection(x, y)
{
	for(var i = 0; i < allHanzi.length; ++i)
	{
		if(!allHanzi[i].is_highlight && allHanzi[i].isTouched(x,y))
		{
			if(checkSelectionDirection(i))
			{
				//selection is in the same straight line
				allHanzi[i].highlight();
				selected.push(i);
				return;
			}			
		}
	}
}

function checkSelectionDirection(index)
{
	var ix = Math.floor(index / grid_num);
	var iy = index % grid_num;
	if(selected.length < 1)
	{
		return true;
	}
	else if(selected.length < 2)
	{
		selected_dir.x = ix - Math.floor(selected[selected.length-1] / grid_num);
		selected_dir.y = iy - selected[selected.length-1] % grid_num;
		//console.log(selected_dir.x, selected_dir.y);
		return true;
	}
	else
	{
		var delta_ix = ix - Math.floor(selected[selected.length-1] / grid_num);
		var delta_iy = iy - selected[selected.length-1] % grid_num;
		//console.log(delta_ix, delta_iy, selected_dir.x, selected_dir.y);
		return delta_ix == selected_dir.x && delta_iy == selected_dir.y;
	}
}

function checkSelection()
{
	var passed = false;
	if(selected.length == poem[next_check].length)
	{
		var candidate = ''
		for(var i=0; i<selected.length; ++i)
		{
			candidate = candidate.concat(allHanzi[selected[i]].zi);
		}
		
		passed = candidate==poem[next_check];	
	}
		
	//console.log(candidate, poem[next_check], passed);
	clearSelection(passed);
	return passed;
}

function clearSelection(keep_highlight)
{
	if(!keep_highlight)
	{
		for(var i=0; i<selected.length; ++i)
		{
			allHanzi[selected[i]].lowlight();
		}
	}
	selected = []	
}

function createPoem(p){		
	for(var i=0; i<p.length; i+=1)
	{
		createSentence(p[i]);
	}
}


function createSentence(s){
	try_num = 0
	while(true)
	{
		dir = Math.floor((Math.random() * NUM_DIRECT) - NUM_DIRECT / 2);
		ix = Math.floor(Math.random() * grid_num);
		iy = Math.floor(Math.random() * grid_num);
		if(checkOrPlaceSentence(ix, iy, dir, s, false))
		{
			checkOrPlaceSentence(ix, iy, dir, s, true);
			return
		}
		try_num++;
	}
	console.log("纵横格生成失败:", s);
	alert("请点击开始重试");
}

function checkOrPlaceSentence(ix, iy, dir, s, place=false)
{
	var delta_ix = dir % 4 == 0 ? 0 : dir > 0 ? 1 : -1;	
	var delta_iy = Math.abs(dir) == 2 ? 0 : Math.abs(dir) < 2 ? 1: -1;
	for(var i = 0; i < s.length; ++i)
	{
		if(ix < 0 || ix >= grid_num || iy < 0 || iy >= grid_num)
			return false
		idx = ix * grid_num + iy;
		if(allHanzi[idx]) return false;
		if(place)
		{
			allHanzi[idx] = new hanzi(ix, iy, s.charAt(i), is_traditional);
			//console.log(ix,iy,s.charAt(i));
		}
		ix += delta_ix;
		iy += delta_iy;
	}
	return true;
}

function createOther(level){
	var candidates = GetPrimaryHanziSet(level)
	for(var i=0; i < grid_num; ++i)
	{
		for(var j=0; j < grid_num; ++j)
		{
			var idx = i * grid_num + j;
			if(allHanzi[idx]) continue;
			var k = Math.floor(Math.random() * candidates.length);
			allHanzi[idx] = new hanzi(i, j, candidates.charAt(k), is_traditional);
		}
	}	
}

function Hanzi2Pinyin(zi){
	return PinyinHelper.convertToPinyinString(zi, '', PinyinFormat.WITH_TONE_MARK);
}

function Simple2Traditional(zi){
	return ChineseHelper.convertToTraditionalChinese(zi);	
}

function hanzi(ix, iy, zi, show_traditional){	
	this.ix = ix;
	this.iy = iy
	this.bgcolor = "#f1f1f1";
	this.textcolor = "#000000";
	this.is_highlight = false;
	this.show_pinyin = false;
	this.show_traditional = show_traditional;
	
	this.togglePinyin = function(){
		this.show_pinyin = !this.show_pinyin;
		this.updateText();
		//console.log(this.show_pinyin, this.pinyin);
	}
	
	this.toggleTraditional = function(is_traditional){
		this.show_traditional = is_traditional;
		this.updateText();
	}
	
	this.updateText = function(){
		if(this.show_pinyin){
			this.text = this.pinyin;
		}else if(this.show_traditional){
			this.text = this.tradtional;
		}else{
			this.text = this.zi;
		}
	}
	
	this.reset = function(zi){
		this.zi = zi;
		this.pinyin = Hanzi2Pinyin(this.zi);
		this.tradtional = Simple2Traditional(zi);
		this.updateText();
	}
	this.reset(zi);
	
	this.resize = function(){
		this.size = HANZI_SIZE;
		this.x = this.ix * this.size;
		this.y = this.iy * this.size;
		this.width = this.size;
		this.height = this.size;
		this.font = this.size + 'px KaiTi';
		this.pyfont = this.size/3 + 'px Arial';
	}
	this.resize();
	
	this.update = function(){
		ctx = myGameArea.context;		
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#808080";
		ctx.strokeRect(this.x, this.y, this.width, this.height);
		
		if(this.is_highlight)
		{
			ctx.fillStyle = this.bgcolor;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}

		ctx.font = this.show_pinyin ? this.pyfont : this.font;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = this.textcolor;
		ctx.fillText(this.text, this.x+(this.width/2), this.y+this.width/2);
	}
	
	this.isTouched = function(x, y){
		return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
	}
	
	this.highlight = function() {
		this.bgcolor = "#66CCFF";
		this.textcolor = "#FF0000";
		this.is_highlight = true;
	}
	
	this.lowlight = function(){
		this.bgcolor = "#f1f1f1";
		this.textcolor = "#000000";
		this.is_highlight = false;
	}
	
	this.frozen = function()
	{
		this.textcolor = "#AAAAAA"
	}
}