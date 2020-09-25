// import { loadCalendar} from "./calendar_loader.js"

// helper
const isDefined = x => typeof x !== 'undefined'

const DayTitles = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Called from index.html to initiate the Vue.js application.
const buildApp = function (selector) {
  return new Vue({
    el: selector,
    data: function () {
      return {}
    },
  })
}


// Base application 
Vue.component('root', {
  data: function () {
    return {
      calendar: {
        config: {
          title: "RR S2H 2020",
          showWeekends: false,
          startDate: "2020-09-01",
          endDate: "2020-12-01",
        },
        items: [
          {
            name: "RR 1.1.0",
            date: "2020-09-27",
            styles: ["release"]
          },
          {
            name: "Dave - PTO",
            date: "2020-10-02",
            styles: ["pto"]
          }
        ],
      },
      loading: false,
      // loaded: false,
      // selectedComponent: null,
      showWeekends: false,
    }
  },
  created: async function () {
  },
  template: `
    <div v-if="loading" class="">
      <spinner /> Loading...
    </div>
    <div v-else id="layout" class="content">
      <calendar-view :calendar="calendar" />
    </div>
  `,
})

Vue.component('calendar-view', {
  props: {
    calendar: Object,
  },

  data() {
    return {
      showWeekends: this.calendar.config.showWeekends == true
    }
  },

  template: `
    <div class="calendar pure-g">
      <div class="pure-u-1">
        <input type="checkbox" id="showWeekendsCheckbox" v-model="showWeekends">
        <label for="showWeekendsCheckbox">Weekends?</label>
      </div>
      <div class="pure-u-2-24">
      </div>
      <calendar-grid 
        class="pure-u-20-24" 
        :showWeekends="showWeekends" 
        :startDateIso="calendar.config.startDate"
        :endDateIso="calendar.config.endDate"
        :items="calendar.items"
      />
      <div class="pure-u-2-24">
      </div>
    </div>
  `,
})


Vue.component('calendar-grid', {
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
      return _.reject(this.days, d => d.weekday == 6 || d.weekday == 7)
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
      
      <div v-for="box in boxes" :class="[cellSizeClass, box.displayClass() ]">
        <day-box :box="box" v-if="box.type === 'day'" />
        <pref-box :box="box" v-elseif="box.type === 'pref'" />
        <div v-else>{{box}}</div>
      </div>

      <div class="pure-u-1">{{scratch}}</div>
    </div>
  `
})

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
    return { daybox: true }
  }
}

Vue.component('day-box', {
  props: ["box"],
  template: `
    <div>
      <div>{{box.getDateString()}}</div>
      <item v-for="item in box.items" :item="item">
    </div>
  `,
})

class PrefBox {
  constructor(monday) {
    this.type = 'pref'
    this.monday = monday
    this.items = []
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
  template: `
    <div>
      <div>{{box.getWeekString()}}</div>
      <item v-for="item in box.items" :item="item">
    </div>
  `,
})

Vue.component('item', {
  props: ["item"],
  template: `
    <div>
      {{item.name}}
    </div>
  `,
})

export default buildApp