$(function(){
	window.App = {};

	//this takes care of getting us random geocoordinates
	//change the limit value to see how bing maps handles large data sets
	//when it finished gathering random coordinates it calls App.Mapper.clusterLayer();
	//which sets the data on the map
	App.GeoManager = {
		init: function(){
			this.coords = [],
			this.pins = [],
			this.curIndex=0,
			this.limit = 2000;
			this.generateCoordinates();
		},

		generateCoordinates: function(){
			var self = this;
			if(self.curIndex == this.limit){
				App.Mapper.clusterLayer();
				return;
			}else{
				$.get('http://www.random.org/decimal-fractions/?num=2&dec=10&col=1&format=plain&rnd=new', function(data){
					var floats = _.compact(data.split('\n')),
					    x = floats[0] * 2 * Math.PI - Math.PI,
					    y = floats[1] * 2 - 1,
					    lng = self.rad2deg(x).toFixed(5),
					    latrad = Math.PI/2 - Math.acos(y),
					    lat = self.rad2deg(latrad).toFixed(5),
					    distortion = Math.pow(self.sec(latrad), 2).toFixed(2),
					    result = {};
					result.Latitude = lat;
					result.Longitude = lng;
			        self.coords.push(result);
			        self.curIndex++;
			        self.generateCoordinates();
				});
			}
		},

		rad2deg: function(arg) {
	      return (360 * arg / (2 * Math.PI));
	    },

	    sec: function(arg){
	      return 1 / Math.cos(arg);
	    } 
	}

	//This does all the map related stuff all the cool clistering brought to you by
	//http://www.bing.com/blogs/site_blogs/b/maps/archive/2011/03/01/bing-maps-v7-modular-design-and-client-side-clustering.aspx
	App.Mapper = {
		init: function(){
			var self =this;
			this.apikey = 'AsUbtz23FnY3VbO9xjXg6l7ood6IHbXlt7tqRZk5_PMopX2iretnt_t4rC-Mbt3P';
			this.map = new Microsoft.Maps.Map($('#map')[0], {
				credentials: this.apikey,
				width: 500, 
				height: 400,
				mapTypeId: Microsoft.Maps.MapTypeId.road
			});

			this.clusteredLayer = new ClusteredEntityCollection(self.map, {
	            singlePinCallback: self.createPin,
	            clusteredPinCallback: self.createClusteredPin
	        });
		},

		createPin: function(data){
			return new Microsoft.Maps.Pushpin(data._LatLong);
		},

		createClusteredPin: function(data, latlong){
			var obj = {}
			obj.latitude = latlong.latitude;
			obj.longitude = latlong.longitude;
			return new Microsoft.Maps.Pushpin(obj, { text: '+' });
		},

		clusterLayer: function(){
		 	this.clusteredLayer.SetData(App.GeoManager.coords);
		}
	}

	App.Mapper.init();
	App.GeoManager.init();
	
});