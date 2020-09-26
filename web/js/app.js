import { isToday, isThisWeek, isWeekend } from "./date_helpers.js"

import { CalendarViewComponent } from "./calendar_view.js"
import { CalendarGridComponent } from "./calendar_grid.js"
import { loadCalendar } from "./calendar_loader.js"

// Helpers
// const isDefined = x => typeof x !== 'undefined'
// const DayTitles = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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
Vue.component('calendar-app', {
  data: function () {
    return {
      calendar: null,
      loading: true,
      loaded: false,
      showWeekends: false,
    }
  },
  created: async function () {
    this.calendar = await loadCalendar("cal1.json")
    for (let i = 0; i < this.calendar.items.length; i++) {
      const item = this.calendar.items[i];
      item.key = i
    }
    this.loading = false
    this.loaded = true
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

Vue.component('spinner', {
  template: `
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  `
})


export default buildApp