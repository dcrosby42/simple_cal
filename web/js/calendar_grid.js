
import { DayBox } from "./day_box.js"
import { PrefBox } from "./pref_box.js"
import { isWeekend } from "./date_helpers.js"

const CalendarGridComponent = Vue.component('calendar-grid', {
    data() {
        return {
        }
    },

    props: {
        startDateIso: {
            type: String,
            default: "2020-05-01",
        },
        endDateIso: {
            type: String,
            default: "2020-09-30",
        },
        items: {
            type: Array,
            default: () => [],
        },
        showWeekends: {
            type: Boolean,
            default: true,
        },
    },

    computed: {
        startDate() {
            let sd = luxon.DateTime.fromISO(this.startDateIso)
            // Back up to the monday that begins the week containing the given date
            while (sd.weekday > 1) {
                sd = sd.plus({ days: -1 })
            }
            return sd
        },
        endDate() {
            let ed = luxon.DateTime.fromISO(this.endDateIso)
            // Push out to the sunday at the end of the week
            while (ed.weekday < 7) {
                ed = ed.plus({ days: 1 })
            }
            return ed
        },
        days() {
            let res = []
            let d = this.startDate
            while (d <= this.endDate) {
                res.push(d)
                d = d.plus({ days: 1 })
            }
            return res
        },

        filteredDays() {
            if (this.showWeekends) {
                return this.days
            }
            return _.reject(this.days, isWeekend)
        },

        boxes() {
            let res = []
            _.chunk(this.filteredDays, this.weekLen).forEach(wk => {
                res.push(new PrefBox(wk[0]))
                let boxes = wk.map(d => new DayBox(d,))
                res = res.concat(boxes)
            });

            let month = ""
            let year = 0
            res.forEach(box => {
                if (box.constructor == DayBox) {
                    // Activate month and year labels for the first appearing day of each month.
                    // Cleverness required in case we're hiding weekends and the 1st falls on a weekend.
                    // Also we want the very first date to have a month label regardless.
                    if (box.date.monthShort != month) {
                        box.showMonth = true
                        month = box.date.monthShort
                    }
                    if (box.date.year != year) {
                        box.showYear = true
                        year = box.date.year
                    }

                    // Apply items
                    box.items = this.itemsByDateStr[box.date.toISODate()]
                }
            });

            return res
        },

        itemsByDateStr() {
            const map = {}
            this.items.forEach(i => {
                const isoDate = i.date
                if (!map[isoDate]) {
                    map[isoDate] = []
                }
                map[isoDate].push(i)
            })
            return map
        },

        weekLen() {
            if (this.showWeekends) {
                return 7
            } else {
                return 5
            }
        },

        cellSizeClass() {
            if (this.showWeekends) {
                return "pure-u-3-24"
            } else {
                return "pure-u-4-24"
            }
        },

        scratch() {
            // const d = luxon.DateTime.fromISO("2017-05-15")  
            // console.log(d)
            // return d.toISODate() // https://moment.github.io/luxon/docs/manual/formatting
        }
    },
    methods: {
    },
    template: `
    <div class="pure-g">
      
      <template v-for="box in boxes">
        <day-box v-if="box.type === 'day'" :box="box" :class="cellSizeClass"/>
        <pref-box v-else-if="box.type === 'pref'" :box="box" :class="cellSizeClass"/>
        <div v-else>{{box}}</div>
      </template>

      <div class="pure-u-1">{{scratch}}</div>
    </div>
  `
})

export { CalendarGridComponent }