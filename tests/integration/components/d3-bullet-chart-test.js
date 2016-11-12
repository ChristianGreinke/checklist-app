import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('d3-bullet-chart', 'Integration | Component | d3 bullet chart', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{d3-bullet-chart}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#d3-bullet-chart}}
      template block text
    {{/d3-bullet-chart}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
