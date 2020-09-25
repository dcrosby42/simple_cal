import { loadResultIndex, loadValidationResult } from "./resultloader.js"

// how many Checks to display on a single page
const DefaultValidationChecksPageSize = 500

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

// Base application for showing ValidationResults.
Vue.component('report-root', {
  data: function () {
    return {
      // validationResults: [],
      resultIndex: [],
      loading: true,
      loaded: false,
      selectedComponent: null,
    }
  },
  created: async function () {
    this.resultIndex = await loadResultIndex();
    this.Window.resultIndex = this.resultIndex // just for debugging
    this.loading = false
    this.loaded = true
  },
  computed: {
    environment() {
      if (this.loaded && this.resultIndex && this.resultIndex.env) {
        return this.resultIndex.env
      } else {
        return "UNKNOWN"
      }
    },
    selectedResultMetas() {
      if (this.loaded && this.resultIndex && this.selectedComponent) {
        // return this.resultIndex[this.selectedComponent] || null
        const metas = this.resultIndex.components[this.selectedComponent] || null
        return metas
      } else {
        return null
      }
    }
  },
  template: `
    <div v-if="loading" class="">
      <spinner /> Loading validation results data...
    </div>
    <div v-else id="layout" class="content pure-g">
      <results-left-nav 
        :resultIndex="resultIndex" 
        :environment="environment" 
        v-on:component-selected="compName => selectedComponent = compName"
        />
      <results-browser :resultMetas="selectedResultMetas" />
    </div>
  `,
})

// Component selector menu.
// Far-left blue left nav bar.
Vue.component('results-left-nav', {
  data() {
    return {}
  },
  props: {
    environment: String,
    resultIndex: Object,
  },
  computed: {
    components() {
      const namedCounts = _.map(_.mapValues(this.resultIndex.components, 'length'), (count, name) => { return { name, count } })
      return _.sortBy(namedCounts, 'name')
    }
  },
  methods: {
  },
  template: `
    <div id="nav" class="pure-u-1">
      <div class="nav-inner">
        <div class="pure-menu">
          <ul class="pure-menu-list">
            <li class="pure-menu-heading">{{environment}}</li>
            <li v-for="comp in components" class="pure-menu-item">
              <a href="#" @click="$emit('component-selected', comp.name)" class="pure-menu-link"
                >{{comp.name}} <span class="email-count">({{comp.count}})</span></a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})

// List of validation results on the left,
// per-ValidationResult info & details on the right.
Vue.component('results-browser', {
  data() {
    return {
      selectedId: null,
      loading: false,
      broken: false,
      selectedResult: null,
    }
  },
  props: {
    resultMetas: Array,
  },
  methods: {
    async selectResult(res) {
      this.selectedId = res.validationId
      this.selectedResult = null
      this.loading = true
      const resultMeta = this.getResultMeta(this.selectedId)
      loadValidationResult(resultMeta).then(validationResult => {
        this.selectedResultMeta = resultMeta
        this.selectedResult = validationResult
        this.loading = false
      }).catch(e => {
        this.loading = false
        this.broken = true
        console.log("FAILED LOADING VALIDATION RESULT", e)
      })
    },

    getResultMeta(validationId) {
      return this.resultMetas.find(r => r.validationId == validationId)
    }
  },
  computed: {
  },
  template: `
    <div class="pure-u-1">
      <div id="list" class="pure-u-1">
        <results-browser-item v-for="res in resultMetas" 
          :key="res.validationId"
          :resultMeta="res" 
          :isSelected="selectedId && res.validationId == selectedId"
          v-on:selected="selectResult(res)"
        />
      </div>
      <validation-result v-if="selectedResult" :validationResult="selectedResult" :resultMeta="selectedResultMeta" />
      <div v-else-if="loading"><spinner />Loading ValidationResult...</div>
      <div v-else-if="broken">BROKEN! see console</div>
      <div v-else>Pick something</div>
    </div>
  `
})

// ValidationResult buttons listed on the left hand side of the ValidationResults browser.
Vue.component('results-browser-item', {
  props: {
    resultMeta: Object,
    isSelected: Boolean,
  },
  computed: {
    selectedClass() {
      return {
        "email-item": true,
        "email-item-selected": this.isSelected,
        // TODO:
        // "validation-list-item-failed": this.validationResult.Status != "pass",
        // "validation-list-item-passed": this.validationResult.Status == "pass",
      }
    }
  },
  template: `
    <div class="pure-u-1" @click="$emit('selected', resultMeta)" :class="selectedClass">
      <h4 class="email-subject">{{resultMeta.validationId}}</h4>
      <p v-if="resultMeta.title" class="email-desc">{{resultMeta.title}}</p>
    </div>
  `
  // <pass-fail-integ class="email-desc" :obj="resultMeta" />
})

// Main view pane for a ValidationResult
Vue.component('validation-result', {
  props: {
    validationResult: Object,
    resultMeta: Object,
  },
  computed: {
    passFailText() {
      if (this.validationResult.Status == "pass") {
        return "OK"
      } else {
        return "FAILED"
      }
    },
    passFailClass() {
      const c = {}
      if (this.validationResult.Status == "pass") {
        c.passing = true
      } else {
        c.failing = true
      }
      return c
    },
    validationChecks() {
      return Object.freeze(this.validationResult.Checks)
    }
  },
  template: `
    <div id="main" class="pure-u-1">
      <div class="email-content">
        <div class="email-content-header pure-g">
          <div class="pure-u-1">
            <h3 class="validation-result-title">{{validationResult.Validation.Component}} - {{validationResult.Validation.Id}} - <span :class="passFailClass">{{passFailText}}</span></h3>
          </div>
          <div class="pure-u-1">
            <p class="email-content-subtitle">{{validationResult.Validation.Title}}</p>
            <p v-if="validationResult.Validation.Notes">{{validationResult.Validation.Notes}}</p>
            <p class="email-content-subtitle">
              Run by <a>{{validationResult.Requester}}</a> at <span>{{validationResult.EndDateTime}}</span>
            </p>
          </div>
          <div class="pure-u-1">
            <table class="pure-table">
              <thead>
                <th>Total</th>
                <th>Passing</th>
                <th>Failing</th>
                <th>Integrity</th>
              </thead>
              <tbody>
                <tr>
                  <td>{{validationResult.TotalCount}}</td>
                  <td>{{validationResult.SuccessCount}}</td>
                  <td>{{validationResult.FailureCount}}</td>
                  <td>{{validationResult.Integrity}}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="validationResult.SummaryData" class="pure-u-1">
            <div v-if="resultMeta" class="json-download"><a :href="resultMeta.path">Download JSON</a> (right-click, Save...)</div>
            <h3>Summary data:</h3>
            <pre>{{validationResult.SummaryData}}</pre>
          </div>
        </div>

        <div class="email-content-body">
          <obj-notes :obj="validationResult" />
          <validation-checks :checks="validationChecks" />
        </div>

      </div>
    </div>
  `
})

// Viewer for Notes, Warnings and Errors on a ValidationResult
Vue.component('obj-notes', {
  props: {
    obj: Object,
  },
  computed: {
    notes() {
      return this.obj.Notes || []
    },
    warnings() {
      return this.obj.Warnings || []
    },
    errors() {
      return this.obj.Errors || []
    },
  },
  template: `
    <div>
      <div v-if="errors.length > 0">
        <h3>Errors</h3>
        <ul>
          <li v-for="err in errors">{{err}}</li>
        </ul>
      </div>

      <div v-if="warnings.length">
        <h3>Warnings</h3>
        <ul>
          <li v-for="warn in warnings">{{warn}}</li>
        </ul>
      </div>

      <div v-if="notes.length">
        <h3>Notes</h3>
        <ul>
          <li v-for="note in notes">{{note}}</li>
        </ul>
      </div>
    </div>
  `
})

// Paginated table of Checks. 
// Some subsets of columns are dynamically included based on whether any Checks actually need them in the current viewing window.
// Eg, Expected and Actual columns only appear if they're in use, similarly the Pass/Fail/Integ% col, similarly the Id/V2Id/V3Id cols.
Vue.component('validation-checks', {
  props: { checks: Array },
  data() {
    return {
      page: 0,
      pageSize: DefaultValidationChecksPageSize,
    }
  },
  watch: {
    checks(oldChecks, newChecks) {
      this.page = 0
    }
  },
  computed: {
    showingChecks() {
      const start = this.page * this.pageSize
      const end = Math.min(this.checks.length, start + this.pageSize)
      const res = []
      for (let i = start; i < end; i++) {
        res.push(this.checks[i])
      }
      return res
    },
    numPages() {
      return Math.ceil(this.checks.length / this.pageSize) + 1
    },
    // In the current result page, are any Checks utilizing their ExpectedValue or ActualValue fields?
    anyExpectedActual() {
      return _.some(this.showingChecks, c => isDefined(c.ExpectedValue) || isDefined(c.ActualValue))
    },
    // In the current result page, are any Checks utilizing their numeric rollup/integrity fields?
    anyExplicitIntegrity() {
      return _.some(this.showingChecks, c => isDefined(c.Integrity))
    },
    // In the current result page, are any Checks utilizing their domain Id fields?
    anyIds() {
      return _.some(this.showingChecks, c => isDefined(c.Id) || isDefined(c.V2Id) || isDefined(c.V3Id))
    },
    anyDatas() {
      return _.some(this.showingChecks, c => isDefined(c.Data))
    },
    anyRowDatas() {
      return _.some(this.showingChecks, c => isDefined(c.V2Row) || isDefined(c.V3Row))
    },
    headerNames() {
      const headers = [
        '#',
        'Description',
        'Status'
      ]
      if (this.anyExpectedActual) {
        headers.push('Expected')
        headers.push('Actual')
      }
      if (this.anyIds) {
        headers.push('Id')
        headers.push('V2Id')
        headers.push('V3Id')
      }
      if (this.anyDatas) {
        headers.push('Data')
      }
      if (this.anyRowDatas) {
        headers.push('V2/V3 Rows')
      }
      if (this.anyExplicitIngegrity) {
        headers.push('Pass/Fail/Integ%')
      }
      return headers
    },
  },
  methods: {
    statusStyle(check) {
      if (check.Status == 'pass') {
        return { "passing": true }
      } else {
        return { "failing": true }
      }
    },
    gotoPage(p) {
      p = p - 1
      if (p >= 0 && p < this.numPages) {
        this.page = p
      }
    },
    literalVal(v) {
      if (v === null) {
        return "<null>"
      } else {
        return v
      }
    },
  },
  template: `
    <div>
    <h3>Checks</h3>
      <page-controls 
        :page="page"
        :pageSize="pageSize"
        :total="checks.length" 
        v-on:prevPage="page = page-1"
        v-on:nextPage="page = page+1"
        v-on:jumpPage="gotoPage(parseInt(Window.prompt('Jump to page:')))"
      />
      <table class="pure-table">
        <thead>
          <th v-for="name in headerNames">{{name}}</th>
        </thead>
        <tbody>
            <tr v-for="(Check,i) in showingChecks" :class="statusStyle(Check)">
              <td class="index">{{(page*pageSize)+i+1}}</td>
              <td class="description">
                {{Check.Description}}
                <obj-notes :obj="Check" />
              </td>
              <td class="status" :class="statusStyle(Check)">{{Check.Status}}</td>
              <td v-if="anyExpectedActual" class="expectedValue"><pre>{{literalVal(Check.ExpectedValue)}}</pre></td>
              <td v-if="anyExpectedActual" class="actualValue"><pre>{{literalVal(Check.ActualValue)}}</pre></td>
              <td v-if="anyIds" class="record-id">{{Check.Id}}</td>
              <td v-if="anyIds" class="record-id">{{Check.V2Id}}</td>
              <td v-if="anyIds" class="record-id">{{Check.V3Id}}</td>
              <td v-if="anyDatas" class="check-data"><code>{{Check.Data}}</code></td>
              <td v-if="anyRowDatas"><row-data-viewer :check="Check" /></td>
              <td v-if="anyExplicitIntegrity" class="passFailInteg">
                <div v-if="Check.SuccessCount || Check.FailureCount">
                  <pass-fail-integ :obj="Check" />
                </div>
              </td>
            </tr>
        </tbody>
      </table>
      <page-controls 
        :page="page"
        :pageSize="pageSize"
        :total="checks.length" 
        v-on:prevPage="page = page-1"
        v-on:nextPage="page = page+1"
        v-on:jumpPage="gotoPage(parseInt(Window.prompt('Jump to page:')))"
      />
    </div>
  `,
})

// Little colorized pass/fail counts
Vue.component('pass-fail-integ', {
  props: { obj: Object },
  computed: {
    successStyle() {
      if (this.obj.SuccessCount && this.obj.SuccessCount > 0) {
        return { passing: true }
      } else {
        return { neutral: true }
      }
    },
    failureStyle() {
      if (this.obj.FailureCount && this.obj.FailureCount > 0) {
        return { failing: true }
      } else {
        return { neutral: true }
      }
    },
    integrityStyle() {
      if (this.obj.FailureCount && this.obj.FailureCount > 0) {
        return { failing: true }
      } else {
        return { passing: true }
      }
    }
  },
  template: `
    <div class="pass-fail-integ">
      <span :class="successStyle">{{obj.SuccessCount}}</span>
      <span :class="failureStyle">{{obj.FailureCount}}</span>
      <span class="total-count">{{obj.TotalCount}}</span>
      <span :class="integrityStyle">{{obj.Integrity}}%</span>
    </div>
  `
})
// Pagination controls for the Check table
Vue.component('page-controls', {
  props: {
    page: Number,
    pageSize: Number,
    total: Number,
  },
  methods: {
    prev() {
      if (this.page > 0) {
        this.$emit('prevPage')
      }
    },
    next() {
      if (this.page < this.lastPage) {
        this.$emit('nextPage')
      }
    },
  },
  computed: {
    lastPage() {
      return Math.floor(this.total / this.pageSize)
    },
    numPages() {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  template: `
    <div v-if="numPages > 1">
      <button v-if="page > 0" @click="prev">PREV</button>
      <span v-else>PREV</span>
      <span class="pager-label" @click="$emit('jumpPage')"> Page {{page+1}} of {{lastPage+1}} </span>
      <button v-if="page < lastPage" @click="next">NEXT</button>
      <span v-else>NEXT</span>
    </div>
  `
})

// Used to show expandable details for Check.V2Row and Check.V3Row
Vue.component('row-data-viewer', {
  props: {
    check: Object,
  },
  data() {
    return {
      expanded: false
    }
  },
  template: `
    <div v-if="expanded" class="row-data-viewer">
      <span class="row-data-expander" @click="expanded=false">(hide)</span>
      <strong class="row-data-header">V2:</strong>
      <code class="v2">{{check.V2Row}}</code>
      <br />
      <strong class="row-data-header">V3:</strong>
      <code class="v3">{{check.V3Row}}</code>
    </div>
    <span v-else class="row-data-expander" @click="expanded=true">(show)</span>
  `
})

Vue.component('spinner', {
  template: `
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  `
})

export default buildApp