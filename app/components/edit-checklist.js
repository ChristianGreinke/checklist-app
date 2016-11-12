import Ember from 'ember';

export default Ember.Component.extend({
    didReceiveAttrs(){
        this._super(...arguments);

        Ember.run.later(function(){
            Ember.$('.checklist-item').addClass('active');
        });
    },
    actions:{
        addReview(item){
            item.set('review',{
                remark:'',
                score:0
            });
        }
    }
});
