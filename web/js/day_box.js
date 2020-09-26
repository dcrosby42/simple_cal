import { isToday, isWeekend } from "./date_helpers.js"
import { ItemComponent } from "./item.js"

class DayBox {
    constructor(d) {
        this.type = 'day'
        this.date = d
        this.showMonth = false
        this.showYear = false
        this.items = []
    }
    getDateString() {
        let str = `${this.date.day}`
        if (this.showMonth || this.date.day == 1) {
            str = `${this.date.monthShort} ${str}`
        }
        if (this.showYear) {
            str = `${str}, ${this.date.year}`
        }
        return str
    }
    displayClass() {
        return { daybox: true, today: isToday(this.date), weekend: isWeekend(this.date) }
    }
}

Vue.component('day-box', {
    props: ["box"],
    template: `
    <div :class="box.displayClass()">
      <div>{{box.getDateString()}}</div>
      <item v-for="item in box.items" :item="item" :key="item.key"/>
    </div>
  `,
})

export { DayBox }