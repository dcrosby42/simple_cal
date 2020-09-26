

class HeaderBox {
    constructor(name) {
        this.type = "header"
        this.name = name
    }
}

Vue.component('header-box', {
    props: ["box"],
    template: `
    <div class="dayheader">
        {{box.name}}
    </div>
  `,
})

export { HeaderBox }