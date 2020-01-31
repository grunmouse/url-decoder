
	
	const param = require('./jquery-param.js');
	const deparam = require('./deparam.js');
	const {decode, encode} = require('./decode.js');
	
     /**
     * private function to parse URL to components
  	 * 
	 * @param {String} url_str //optional, if omited using current location
	 * @return {Object}
     */		
	function parse(url_str, deparamAnchor) {
		if(typeof url_str == 'boolean'){
			deparamAnchor = url_str;
			url_str = window.location.href;
		}
		url_str = url_str || window.location.href;
		
		/**
		* @author of RegExp Steven Levithan 
		* @editor Dmitriy Rakov
		*/
		var re = /^((?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):(?:\/\/)?)?((?:(([^:@]*):?([^:@]*))@)?([^:\/?#]*)(?::(\d*))?))(((\/(?:(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/)?)?([^?#\/]*))(?:\?([^#]*))?(#(.*))?)$/;
		
		var keys = ["source","domain", "protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","local", "anchor"];
		
		var m = re.exec( url_str );
		var uri = {};
		var i = keys.length;
		var file;
		
		while ( i-- ) {
			uri[ keys[i] ] = m[i] || "";
		}
		
		
		file = uri.file.split('.');
		uri.fileExt = (file.length>1) ? file.pop() : '';
		uri.filename = file.join('.');
		
		uri.params = uri.query ? deparam(uri.query, true) : {};
		if(deparamAnchor){
			uri.anchorParams = uri.query ? deparam(uri.anchor, true) : {};
		}
		
		return uri;
	}


     /**
     * private function to build URL string from components
  	 * 
	 * @param {Object} url_obj //required
	 * @return {String}
     */		
	function build(url_obj) {
		
		if (url_obj.source){
			return encodeURI(url_obj.source);
		}
		
		var resultArr = [];
		
		if(url_obj.domain){
			resultArr.push(url_obj.domain);
		}
		else{
			if (url_obj.protocol){
				if (url_obj.protocol == 'file'){
					resultArr.push('file:///');
				}
				else if (url_obj.protocol == 'mailto'){
					resultArr.push('mailto:');
				}
				else {
					resultArr.push(url_obj.protocol + '://');
				}
			}
			
			if (url_obj.authority){
				resultArr.push(url_obj.authority);
			}
			else {
				if (url_obj.userInfo){
					resultArr.push(url_obj.userInfo + '@');
				} 
				else if(url_obj.user){
					resultArr.push(url_obj.user);
					if(url_obj.password){
						resultArr.push(':' + url_obj.password);
					}
					resultArr.push('@');
				}
				
				if (url_obj.host){
					resultArr.push(url_obj.host);
					if(url_obj.port){
						resultArr.push(':' + url_obj.port);
					}
				}
			}
		}
		
		if(url_obj.relative){
			resultArr.push(url_obj.relative);
		}
		else{
			if (url_obj.path){
				resultArr.push(url_obj.path);
			} 
			else {
				if(url_obj.directory){
					resultArr.push(url_obj.directory);
					if(url_obj.file){
						resultArr.push(url_obj.file);
					}
					else if(url_obj.filename){
						resultArr.push(url_obj.filename);
						if(url_obj.fileExt){
							resultArr.push('.' + url_obj.fileExt);
						}
					}
				}
				
			}

			if (url_obj.query){
				resultArr.push('?' + url_obj.query);
			} else if(url_obj.params){
				let query = param(url_obj.params);
				if(query){
					resultArr.push('?' + query);
				}
			}
			
			if (url_obj.anchor){
				resultArr.push('#' + url_obj.anchor);
			}
			else if(url_obj.anchorParams){
				let query = param(url_obj.anchorParams);
				if(query){
					resultArr.push('#' + query);
				}
			}
		}
		
		return resultArr.join('');
	}

	var parents = {
		"source":null,
		"domain":"source",
		"protocol":"domain",
		"authority":"domain",
		"userInfo":"authority",
		"user":"userInfo",
		"password":"userInfo",
		"host":"authority",
		"port":"authority",
		"relative":"source",
		"path":"relative",
		"directory":"path",
		"file":"path",
		"filename":"file",
		"fileExt":"file",
		"query":"relative",
		"params":"query",
		"local":"relative",
		"anchor":"local",
		"anchorParams":"anchor"
	};
	
	function kill(url_obj, el_name){
		if(url_obj[el_name]){
			delete url_obj[el_name];
		}
		if(parents[el_name]){
			kill(url_obj, parents[el_name]);
		}
	}
	
	function prepare(url_obj, el_name){
		kill(url_obj, parents[el_name]);
	}


	/**
     * public functions
  	 * 
	 * @see #encode
	 * @see #decode
	 * @see #parse
	 * @see #build
	 * @see #deparam
	 *
	 * @return {Object}
     */		
module.exports = {
	encode: encode,
	decode: decode,
	parse: parse,
	build: build,
	deparam: deparam,
	param: param,
	kill: kill,
	prepare: prepare
};

