import Ember from 'ember';

export default Ember.Component.extend({
    classNames:['page-new-checklist'],
    didInsertElement(){
        Ember.run.later(function(){
            Ember.$('div.file-picker').addClass('active');
        });
    },
    isChecklistLoaded:false,
    checklistToSave:Ember.computed('checklist.items.@each.value','checklist.items.@each.review',function(){
        return {
            template:this.get('checklist.template'),
            visualizationProfiles:this.get('checklist.visualizationProfiles'),
            items:this.get('checklist.items').map(function(item){
                return {
                    id:item.get('id'),
                    value:!Ember.isEmpty(item.get('value'))?item.get('value').toString():'',
                    review:item.get('review')||null
                }
            })
        };
    }),
    actions:{
        fileLoaded:function(file){
            try{
                let checklist = JSON.parse(file.data);
            this.set('checklist',{
                template:checklist.template,
                visualizationProfiles:checklist.visualizationProfiles,
                items:checklist.items.map(function(item){
                    return Ember.Object.create(item);
                })
            });
            
            this.set('isChecklistLoaded',true);

            
            return true;
            }catch(exc){
                return false;
            }
            
        }
    }
});
