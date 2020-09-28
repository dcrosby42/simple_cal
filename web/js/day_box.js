import { isToday, isWeekend, dayIsPast } from "./date_helpers.js"
import { ItemComponent } from "./item.js"

class DayBox {
    constructor(d) {
        this.type = 'day'
        this.date = d
        this.showMonth = false
        this.showYear = false
        this.items = []
    }
    isToday() {
        return isToday(this.date)
    }
    isPast() {
        return dayIsPast(this.date)
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
    domId() {
        if (this.isToday()) {
            return "day-box-today"
        }
        return null
    }
    displayClass() {
        return { daybox: true, today: this.isToday(), past: this.isPast(), weekend: isWeekend(this.date) }
    }
}

Vue.component('day-box', {
    props: ["box"],
    template: `
    <div :id="box.domId()" :class="box.displayClass()">
      <div>{{box.getDateString()}}</div>
      <item v-for="item in box.items" :item="item" :key="item.key"/>
    </div>
  `,
})

export { DayBox }