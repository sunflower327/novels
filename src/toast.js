import { reactive } from 'vue'

const state = reactive({ msg: '', show: false, timer: null })

export function notify(msg) {
  state.msg = msg
  state.show = true
  if (state.timer) clearTimeout(state.timer)
  state.timer = setTimeout(() => (state.show = false), 2200)
}

export function useToast() {
  return state
}
