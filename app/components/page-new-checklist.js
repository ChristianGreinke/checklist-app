import Ember from 'ember';

export default Ember.Component.extend({
    classNames:['page-new-checklist'],
    didInsertElement(){
        Ember.run.later(function(){
            Ember.$('div.file-picker').addClass('active');
        });
    },
    isTemplateLoaded:false,
    generatedItems:[],
    checklistToSave:Ember.computed('generatedItems.@each.value',function(){
        return {
            template:this.get('template'),
            items:this.get('generatedItems').map(function(item){
                return {
                    id:item.id,
                    value:!Ember.isEmpty(item.value)?item.value.toString():''
                }
            })
        };
    }),
    parseCheckItems(items){
        return items.reduce(function(agg,cur){
            switch(cur.type){
                case 'text':
                case 'number':
                case 'textarea':
                case 'choose':
                    agg.pushObject({id:cur.id,value:''});
                    break;
                case 'rating-group':
                    cur.ratings.forEach(function(rating){
                        agg.pushObject({id:rating.id,value:''});
                    });
                    break;
                case 'check-group':
                    cur.checks.forEach(function(check){
                        agg.pushObject({id:check.id,value:''});
                    });
                    break;
            }

            return agg;
        },[]);
    },
    actions:{
        fileLoaded:function(file){
            try{
                let template = JSON.parse(file.data);
            this.set('template',template);
            // this.set('templateName',template.name);
            // this.set('templateVersion',template.version);
            this.set('generatedItems',this.parseCheckItems(template.checkItems));
            this.set('isTemplateLoaded',true);

            
            return true;
            }catch(exc){
                return false;
            }
            
        }
    }
});
