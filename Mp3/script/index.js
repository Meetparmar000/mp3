var url;
var res;
var dl_host = 'https://dl.y2mp3.app';
var api_host = 'https://api.fabdl.com';

function get_mp3()
{
	if (typeof timer != 'undefined') {
		clearInterval(timer);
	}
	let val = document.getElementById('search-input').value;
	if (val) {
		if (val == url && res) {
			print_content(res);
		} else {
			url = val;
			res = null;
			if (val.indexOf('/playlist?list=') < 0) {
				var get_url = dl_host + '/youtube/get?url=' + encodeURIComponent(url);
			} else {
				var get_url = api_host + '/youtube/get-playlist?url=' + encodeURIComponent(url);
			}
			document.getElementById('search-submit').style.display = 'none';
			document.getElementById('loader').style.display = 'inline-block';
			document.getElementById("info").innerHTML = "<img style='height: 300px;' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' />";
			axios.get(get_url).then(function (response) {
				document.getElementById('search-submit').style.display = 'inline-block';
				document.getElementById('loader').style.display = 'none';
				if (response.data.result) {
					res = response.data.result;
					print_content(response.data.result);
				} else {
					document.getElementById("info").innerHTML = '<b style="color:red;">An error has occured while searching. Please try again later.</b>';
				}
			}).catch(function (error) {
				console.log(error);
			});
		}
	} else {
		alert('Paste URL');
	}
}

function print_content(result)
{
	if (!result['type']) {
		return get_youtube_mp3(result);
	}
	let html = "<img style='height: 300px;' src='"+result.image+"' />";
	html += "<h3>"+result.title+"</h3>";
	html += "<p>" + result.author +"</p>"
	for (var i in result.watches) {
		var watch = result.watches[i];
		let param = btoa(encodeURIComponent(JSON.stringify({
			'id': watch.id,
			'title': watch.title,
			'image': watch.image,
			'duration': watch.duration,
			'author': watch.author,
			'mp3_task_url': watch.mp3_task_url,
		})));
		html += '<div class="grid-playlist-container mb-3">';
		
		html += '<div class="grid-item"><div class="grid-text"><span>' + (parseInt(i) + 1) + '.</span></div></div>';
		
		html += '<div class="grid-item"><img src="' + watch.image + '" /></div>';
		
		html += '<div class="grid-item"><div class="grid-text"><span>' + watch.title + '</span><br>' + watch.author + '</div></div>';
		html += '<div class="grid-item"><input class="get-download-submit" type="submit" value="Get Download" onclick="mp3_convert_task(\'' + param + '\')"></div>';
		html += '</div>';
	}
	document.getElementById("info").innerHTML = html;
}

function mp3_convert_task(data)
{
	document.querySelector('#main').scrollIntoView(true);
	data = JSON.parse(decodeURIComponent(atob(data)));
	let html = "<img style='height: 300px;' src='" + data.image + "' />";
	html += "<h3>" + data.title + "</h3><p>" + data.author + "</p>";
	html += "<div id='download_mp3'><a class='download-btn download-loading' href=''>Get Download</a></div>";
	document.getElementById("info").innerHTML = html;
	axios.get(api_host + data.mp3_task_url).then(function (response) {
		if (response.data.result) {
			var tid = response.data.result.tid;
			window.timer = setInterval(()=>{ 
				setTimeout(function () {
					axios.get(api_host + '/youtube/mp3-convert-progress/' + tid ).then(function (response) {
						if (response.data.result) {
							let result =  response.data.result;
							if (result.status == 3) {
								document.getElementById("download_mp3").innerHTML = "<a class='download-btn' href='" + api_host + result.download_url + "'>Download MP3</a>";
								clearInterval(timer);
							} else if (result.status < 0) {
								alert('convert error');
								clearInterval(timer);
							}
						} else {
							alert('convert error');
							clearInterval(timer);
						}
					}).catch(function (error) {
						console.log(error);
					});
				}, 0);
			}, 1000);
		} else {
			alert('task error');
		}
	}).catch(function (error) {
		console.log(error);
	});	
}

function get_youtube_mp3 (data)
{
	let html = "<img style='height: 300px;' src='" + data.image + "' />";
	html += "<h3>" + data.title + "</h3><p>" + data.author + "</p>";
	html += "<div id='download_mp3'><a class='download-btn download-loading' href=''>Get Download</a></div>";
	document.getElementById("info").innerHTML = html;
	
	if (parseInt(data.duration) > 1800) {
		axios.get(data.get_mp3_download_url).then(function (response) {
			if (response.data.result) {
				if (response.data.result.download_url) {
					document.getElementById("download_mp3").innerHTML = "<a class='download-btn' href='" + response.data.result.download_url + "'>Download MP3</a>";
					return;
				}
			}
			alert('convert error');
		}).catch(function (error) {
			console.log(error);
		});	
	} else {
		axios.get(data.mp3_task_url).then(function (response) {
			if (response.data.result) {
				var tid = response.data.result.tid;
				window.timer = setInterval(()=>{ 
					setTimeout(function () {
						axios.get(api_host + '/youtube/mp3-convert-progress/' + tid ).then(function (response) {
							if (response.data.result) {
								let result =  response.data.result;
								if (result.status == 3) {
									document.getElementById("download_mp3").innerHTML = "<a class='download-btn' href='" + api_host + result.download_url + "'>Download MP3</a>";
									clearInterval(timer);
								} else if (result.status < 0) {
									alert('convert error');
									clearInterval(timer);
								}
							} else {
								alert('convert error');
								clearInterval(timer);
							}
						}).catch(function (error) {
							console.log(error);
						});
					}, 0);
				}, 1000);
			} else {
				alert('task error');
			}
		}).catch(function (error) {
			console.log(error);
		});	
	}
}