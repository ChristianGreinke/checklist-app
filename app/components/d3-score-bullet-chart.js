import Ember from 'ember';
import { line } from 'd3-shape';
import { scaleLinear,scaleBand } from 'd3-scale';
import { select,selectAll } from 'd3-selection';
import {descending} from 'd3-array';
import {format} from "d3-format";
import 'd3-transition';

export default Ember.Component.extend({
  classNames:['map-inspector'],
  xmlns: 'http://www.w3.org/2000/svg',
  didInsertElement: function() {
		var _self=this;
		
   		this._resizeHandler = function() {
			Ember.run.once(this,function(){
				let _width= Ember.$('#' + this.elementId).parent().innerWidth()-100;
				_self.set('width', _width);
				
				
			});
		}.bind(this);
		Ember.$(window).on('resize', this._resizeHandler);
		this._resizeHandler();
	},
	
	willDestroyElement: function() {
		Ember.$(window).off('resize', this._resizeHandler);
	},
  svgContainer: function(){
      return select("#"+this.elementId);
  }.property(),
  margin:{top: 0,right: 10,bottom: 30,left: 250},
  width:500,
  height:30,
  bulletCharts:function(){
      return bulletChart()
    .width(this.get('width'))
    .height(this.get('height'));
  }.property(),
  didRender(){
      this._resizeHandler();
      Ember.run.once(this,function(){
        let data = this.get('data');
        let chart = this.get('svgContainer');
        let width=this.get('width');
        let height=this.get('height');
        let margin=this.get('margin');

        var bulletCharts = bulletChart()
                .width(width)
                .height(height)

        let buildChart = chart.selectAll("svg")
        .data(data)
        .enter().append("svg")
        .attr("class", "bullet")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("class", "wrapper")
        .attr("transform", "scale(1)")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(bulletCharts);

    var title = buildChart.append("g")
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + height / 2 + ")");

    title.append("text")
        .attr("class", "title")
        .text(function(d) { return d.title; });

    title.append("text")
        .attr("class", "subtitle")
        .attr("dy", "1em")
        .text(function(d) { return d.subtitle; });
    });
    }
  
});

// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
let bulletChart = function() {
  var orient = "left", // TODO top & bottom
      reverse = false,
      duration = 0,
      ranges = bulletRanges,
      markers = bulletMarkers,
      measures = bulletMeasures,
      width = 500,
      height = 30,
      tickFormat = null;

  // For each small multiple…
  function bullet(g) {
    g.each(function(d, i) {
      var rangez = d.ranges.slice().sort(descending),
          markerz = markers.call(this, d, i).slice().sort(descending),
          measurez = measures.call(this, d, i).slice().sort(descending),
          g = select(this);

        //   rangez.unshift('rmin');
        //   rangez.push('rmax');
        var min = 0;
        var max = Math.max(rangez[0], markerz[0], measurez[0]);

      // Compute the new x-scale.
      var x1 = scaleLinear().domain([0, max])
      .range([0, width]);

      var markx1 = markerX(x1);

      var color_scale = scaleLinear().domain([min,Math.floor( (max-min)/2),max]).range(d.colors);
     

      // Derive width-scales from the x-scales.
      var rw1 = rectWidth(x1);
      var mw1 = measureWidth(x1);

      // Update the range rects.
      var range = g.selectAll("rect.range")
          .data(rangez);

      range.enter().append("rect")
          .attr("class", function(d, i) { return "range s" + i; })
          .attr("width", rw1)
          .attr("height", height)
          .attr("x",  0)
          .style("fill", function(d){ return color_scale(d);})
          .style("opacity", 0.4); 
          


      // Update the measure rects.
      var measure = g.selectAll("rect.measure")
          .data(measurez);

      measure.enter().append("rect")
          .attr("class", function(d, i) { return "measure s" + i; })
          .attr("width", mw1)
          .attr("height", height / 3)
          .attr("x",  0)
          .attr("y", height / 3);

      // Update the marker lines.
      var marker = g.selectAll("line.marker")
          .data(markerz);

      marker.enter().append("line")
          .attr("class", "marker")
          .attr("x1", markx1)
          .attr("x2", markx1)
          .attr("y1", height / 6)
          .attr("y2", height * 5 / 6);


      var ticks = d.ranges;


      // Update the tick groups.
      var tick = g.selectAll("g.tick")
          .data(ticks, function(d) {
            return d;
          });

      // Initialize the ticks with the old scale, x0.
      var tickEnter = tick.enter().append("g")
          .attr("class", "tick")
          .attr("transform", bulletTranslate(markx1))
          .style("opacity", 1);

      tickEnter.append("line")
          .attr("y1", height)
          .attr("y2", height * 7 / 6);

      tickEnter.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "1em")
          .attr("y", height * 7 / 6)
          .text(function(d){return d;});


      

   
    });
 
  }

  // left, right, top, bottom
  bullet.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    reverse = orient == "right" || orient == "bottom";
    return bullet;
  };

  // ranges (bad, satisfactory, good)
  bullet.ranges = function(x) {
    if (!arguments.length) return ranges;
    ranges = x;
    return bullet;
  };

  // markers (previous, goal)
  bullet.markers = function(x) {
    if (!arguments.length) return markers;
    markers = x;
    return bullet;
  };

  // measures (actual, forecast)
  bullet.measures = function(x) {
    if (!arguments.length) return measures;
    measures = x;
    return bullet;
  };

  bullet.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bullet;
  };

  bullet.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return bullet;
  };

  bullet.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return bullet;
  };

  bullet.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return bullet;
  };

  return bullet;
};

function bulletRanges(d) {
  return d.ranges;
}

function bulletMarkers(d) {
  return d.markers;
}

function bulletMeasures(d) {
  return d.measures;
}

function bulletTranslate(x) {
  return function(d) {
    return "translate(" + x(d) + ",0)";
  };
}

function rectWidth(x) {
  var x0 = x(0);
  return function(d) {
    return Math.abs(x(d) - x0);
  };
}

function measureWidth(x) {
  var x0 = x(0);
  return function(d) {
    return Math.abs(x(d) - x0);
  };
}

function markerX(x) {
  var x0 = x(0);
  return function(d) {
    return Math.abs(x(d) - x0);
  };
}