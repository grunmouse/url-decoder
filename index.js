/** --------------------------------------------------------------------------
 *	jQuery URL Decoder
 *	Version 1.0
 *	Parses URL and return its components. Can also build URL from components
 *	
 * ---------------------------------------------------------------------------
 *	HOW TO USE:
 *
 *	$.url.decode('http://username:password@hostname/path?arg1=value%40+1&arg2=touch%C3%A9#anchor')
 *	// returns
 *	// http://username:password@hostname/path?arg1=value@ 1&arg2=touché#anchor
 *	// Note: "%40" is replaced with "@", "+" is replaced with " " and "%C3%A9" is replaced with "é"
 *	
 *	$.url.encode('file.htm?arg1=value1 @#456&amp;arg2=value2 touché')
 *	// returns
 *	// file.htm%3Farg1%3Dvalue1%20%40%23456%26arg2%3Dvalue2%20touch%C3%A9
 *	// Note: "@" is replaced with "%40" and "é" is replaced with "%C3%A9"
 *	
 *	$.url.parse('http://username:password@hostname/path?arg1=value%40+1&arg2=touch%C3%A9#anchor')
 *	// returns
 *	{
 *		source: 'http://username:password@hostname/path?arg1=value%40+1&arg2=touch%C3%A9#anchor',
 *		protocol: 'http',
 *		authority: 'username:password@hostname',
 *		userInfo: 'username:password',
 *		user: 'username',
 *		password: 'password',
 *		host: 'hostname',
 *		port: '',
 *		path: '/path',
 *		directory: '/path',
 *		file: '',
 *		relative: '/path?arg1=value%40+1&arg2=touch%C3%A9#anchor',
 *		query: 'arg1=value%40+1&arg2=touch%C3%A9',
 *		anchor: 'anchor',
 *		params: {
 *			'arg1': 'value@ 1',
 *			'arg2': 'touché'
 *		}
 *	}
 *	
 *	$.url.build({
 *		protocol: 'http',
 *		user: 'username',
 *		password: 'password',
 *		host: 'hostname',
 *		path: '/path',
 *		query: 'arg1=value%40+1&arg2=touch%C3%A9',
 *		// or 
 *		//params: {
 *		//	'arg1': 'value@ 1',
 *		//	'arg2': 'touché'
 *		//}
 *		anchor: 'anchor',
 *	})
 *	// returns
 *	// http://username:password@hostname/path?arg1=value%40+1&arg2=touch%C3%A9#anchor	
 *	
 * ---------------------------------------------------------------------------
 * OTHER PARTIES' CODE:
 *
 * Parser based on the Regex-based URI parser by Steven Levithan.
 * For more information visit http://blog.stevenlevithan.com/archives/parseuri
 *
 * Deparam taken from jQuery BBQ by Ben Alman. Dual licensed under the MIT and GPL licenses (http://benalman.com/about/license/)
 * http://benalman.com/projects/jquery-bbq-plugin/
 *  
 * ---------------------------------------------------------------------------
	
*/
	
	let param = require('./jquery-param.js');
	let deparam = require('./deparam.js');
	let {decode, encode} = require('./decode.js');
	
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
		*/
		var re = /^((?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):(?:\/\/)?)?((?:(([^:@]*):?([^:@]*))@)?([^:\/?#]*)(?::(\d*))?))(((\/(?:(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/)?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)$/;
		
		var keys = ["source","domain", "protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];
		
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
			} else  if(url_obj.params){
				resultArr.push('?' + $.param(url_obj.params));
			}
			
			if (url_obj.anchor){
				resultArr.push('#' + url_obj.anchor);
			}
			else if(url_obj.anchorParams){
				resultArr.push('#' + $.param(url_obj.anchorParams));
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
		"anchor":"relative",
		"anchorParams":"anchor"
	};
	
	function kill(url_obj, el_name){
		if(url_obj[el_name]){
			delete url_obj[el_name];
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

