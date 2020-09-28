
import { isThisWeek } from "./date_helpers.js"
import { ItemComponent } from "./item.js"

class PrefBox {
    constructor(monday) {
        this.type = 'pref'
        this.monday = monday
        this.items = []
    }
    weekNumber() {
        return this.monday.weekNumber
    }
    getWeekString() {
        return "w" + this.monday.weekNumber
    }
    displayClass() {
        return { prefbox: true }
    }
}

Vue.component('pref-box', {
    props: ["box"],
    methods: {
        isThisWeek, // imported for local use
    },
    template: `
    <div :class="box.displayClass()">
      <div :class="{thisweek:isThisWeek(box.monday)}">{{box.getWeekString()}}</div>
      <item v-for="item in box.items" :item="item" :key="item.key"/>
    </div>
  `,
})

export { PrefBox }