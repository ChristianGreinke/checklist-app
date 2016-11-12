import Ember from 'ember';
import {descending} from 'd3-array';

export default Ember.Component.extend({
    classNames:['page-visualize-checklist'],
    didInsertElement(){
        Ember.run.later(function(){
            Ember.$('div.file-picker').addClass('active');
        });

        

            var beforePrint = function() {
                let relWidth = 400 / (Ember.$('.page-visualize-checklist').parent().innerWidth()-100) ;

                Ember.$('svg g.wrapper').attr('transform','scale('+relWidth+')');
            };
            var afterPrint = function() {
                Ember.$('svg g.wrapper').attr('transform','scale(1)');
            };

            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function(mql) {
                    if (mql.matches) {
                        beforePrint();
                    } else {
                        afterPrint();
                    }
                });
            }

            window.onbeforeprint = beforePrint;
            window.onafterprint = afterPrint;
    },
    isChecklistLoaded:false,
    profiles:Ember.computed('checklist',function(){
        return this.get('checklist.visualizationProfiles');
    }),
    profile:Ember.computed('profiles',function(){

        return this.get('profiles')[0];
    }),
    generatedVisualizations:Ember.computed('checklist','profile',function(){
        let checks = this.get('checklist.items');
        return this.get('profile.groups').map(function(grp){
            switch(grp.type){
                case 'visualization-title':
                    return {
                        title:checks.findBy('id',grp.checkId).value,
                        type:grp.type,
                        pageBreak:grp.pageBreak||false
                    };
                case 'ordinal-bullet-chart':

                    return {
                        title:grp.title,
                        type:grp.type,
                        pageBreak:grp.pageBreak||false,
                        data:grp.items.map(function(item){
                            return {
                                title:item.label,
                                subtitle:'',
                                ranges:(item.ranges||grp.ranges).map(function(rng){return rng.label;}),
                                measures:[(item.ranges||grp.ranges).findBy('id', checks.findBy('id',item.checkId).value).label],
                                markers:item.markers||grp.markers,
                                colors:item.colors||grp.colors
                            }
                        }),
                        remarks:grp.items.reduce(function(agg,cur){
                            let review= checks.findBy('id',cur.checkId).review||false
                            if(!review) return agg;
                            if(!Ember.isEmpty(review.remark)){ agg.pushObject(review.remark);}

                            return agg;
                        },[])
                    };
                case 'score-bullet-chart':

                    return {
                        title:grp.title,
                        type:grp.type,
                        pageBreak:grp.pageBreak||false,
                        data:grp.items.map(function(item){
                            
                            let score = checks.findBy('id',item.checkId).review.score;
                            if(score === undefined ) {score = checks.findBy('id',item.checkId).score;}

                            return {
                                title:item.label,
                                subtitle:(item.showValue===undefined||item.showValue)?checks.findBy('id',item.checkId).value||'':'',
                                ranges:(item.ranges||grp.ranges),
                                measures:[score],
                                markers:item.markers||grp.markers,
                                colors:item.colors||grp.colors
                            };
                        }),
                        remarks:grp.items.reduce(function(agg,cur){
                            let review= checks.findBy('id',cur.checkId).review||false
                            if(!review) return agg;
                            if(!Ember.isEmpty(review.remark)){ agg.pushObject(review.remark);}

                            return agg;
                        },[])
                    };
                case 'rating-bullet-chart':

                    return {
                        title:grp.title,
                        type:grp.type,
                        pageBreak:grp.pageBreak||false,
                        data:grp.items.map(function(item){
                            let ranges = item.ranges||grp.ranges;
                            let inverse = item.inverse||false;
                            let rating = checks.findBy('id',item.checkId).value;
                            let score=inverse?ranges.slice().sort(descending)[0]-rating:rating;
                            return {
                                title:item.label,
                                subtitle:'',
                                ranges:ranges,
                                measures:[score],
                                markers:item.markers||grp.markers,
                                colors:item.colors||grp.colors
                            };
                        }),
                        remarks:grp.items.reduce(function(agg,cur){
                            let review= checks.findBy('id',cur.checkId).review||false
                            if(!review) return agg;
                            if(!Ember.isEmpty(review.remark)){ agg.pushObject(review.remark);}

                            return agg;
                        },[])
                    };
            }
        });
    }),
    actions:{
        fileLoaded:function(file){
            try{
                let checklist = JSON.parse(file.data);
            this.set('checklist',checklist);
            
            this.set('isChecklistLoaded',true);

            
            return true;
            }catch(exc){
                return false;
            }
            
        }
    }
});
