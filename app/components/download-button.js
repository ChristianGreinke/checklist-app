import Ember from 'ember';

export default Ember.Component.extend({
    actions:{
    downloadFileContent:function(){
        let _decodedContent = JSON.stringify( this.get('content'));
        var blob = new Blob([_decodedContent], {type: "application/json"});
        // var url  = URL.createObjectURL(blob);

        // var a = document.createElement('a');
        // a.download    = "backup.json";
        // a.href        = url;
        // a.textContent = "Download backup.json";
        // a.click();
        saveAs(blob,this.get('fileName'));
    }
  }
});
