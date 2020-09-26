
const ItemComponent = Vue.component('item', {
    props: ["item"],
    template: `
    <div class="item" :class="item.styles">
      {{item.name}}
    </div>
  `,
})


export { ItemComponent } 