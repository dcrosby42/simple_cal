// import { loadCalendar} from "./calendar_loader.js"

// helper
const isDefined = x => typeof x !== 'undefined'

// Called from index.html to initiate the Vue.js application.
const buildApp = function (selector) {
  return new Vue({
    el: selector,
    data: function () {
      return {}
    },
  })
}

class PrefBox {
  constructor(monday) {
    this.monday = monday
  }
  toString() {
    return "w" + this.monday.weekNumber
  }
  displayClass() {
    return { prefbox: true }
  }
}
class DayBox {
  constructor(d) {
    this.date = d
    this.showMonth = false
  }
  toString() {
    if (this.showMonth || this.date.day == 1) {
      return `${this.date.monthShort} ${this.date.day}`
    }
    return `${this.date.day}`
  }
  displayClass() {
    return { daybox: true }
  }
}

// Base application 
Vue.component('root', {
  data: function () {
    return {
      // calendar: {},
      loading: false,
      // loaded: false,
      // selectedComponent: null,
      showWeekends: false,
    }
  },
  created: async function () {
    // this.calendar = await loadCalendar();
    // this.Window.cal = this.calendar // just for debugging
    // this.loading = false
    // this.loaded = true
  },
  template: `
    <div v-if="loading" class="">
      <spinner /> Loading...
    </div>
    <div v-else id="layout" class="content pure-g">
      <div class="pure-u-1">
        <input type="checkbox" id="showWeekendsCheckbox" v-model="showWeekends">
        <label for="showWeekendsCheckbox">Weekends?</label>
      </div>
      <div class="pure-u-2-24">
      </div>
      <calendar-grid class="pure-u-20-24" :showWeekends="showWeekends" />
      <div class="pure-u-2-24">
      </div>
    </div>
  `,
})

const DayTitles = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

Vue.component('calendar-grid', {
  data() {
    return {
      // showWeekends: false,
      startDate: luxon.DateTime.fromISO('2020-09-01'),
      endDate: luxon.DateTime.fromISO('2020-11-02'),
    }
  },

  props: {
    showWeekends: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
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
      let initial = true
      _.chunk(this.filteredDays, this.weekLen).forEach(wk => {
        res.push(new PrefBox(wk[0]))
        let boxes = wk.map(d => new DayBox(d,))
        if (initial) {
          boxes[0].showMonth = true
          initial = false
        }
        res = res.concat(boxes)

      });
      return res
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
        {{box}}
      </div>
      <div class="pure-u-1">
      {{scratch}}
      </div>
    </div>
  `
})

export default buildApp