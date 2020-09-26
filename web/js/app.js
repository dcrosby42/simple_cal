import { isToday, isThisWeek, isWeekend } from "./date_helpers.js"

import { CalendarViewComponent } from "./calendar_view.js"
import { CalendarGridComponent } from "./calendar_grid.js"

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
      calendar: {
        config: {
          title: "RR S2H 2020",
          showWeekends: true,
          startDate: "2020-09-01",
          endDate: "2020-12-01",
        },
        items: [
          {
            name: "RR 1.1.0",
            date: "2020-09-29",
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
    for (let i = 0; i < this.calendar.items.length; i++) {
      const item = this.calendar.items[i];
      item.key = i
    }
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

export default buildApp