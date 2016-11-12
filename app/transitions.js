
export default function(){
this.transition(
  this.toRoute('new'),
  this.use('fade')
);

this.transition(
  this.toRoute('edit'),
  this.use('toLeft')
);

this.transition(
  this.toRoute('index'),
  this.use('fade')
);
}