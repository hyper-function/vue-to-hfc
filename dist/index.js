import { createApp, h, reactive, ref } from "vue";
function toVueSlots(props) {
    const slots = {};
    const slotKeys = Object.keys(props.slots);
    for (let i = 0; i < slotKeys.length; i++) {
        const slotKey = slotKeys[i];
        const slotFn = props.slots[slotKey];
        slots[slotKey] = (ps) => {
            const container = ref(null);
            function renderSlot() {
                slotFn(container.value, ps);
            }
            return h(ps.__tag || "div", {
                ref: container,
                onVnodeUpdated: renderSlot,
                onVnodeMounted: renderSlot,
            });
        };
    }
    return slots;
}
function toVueAttrsAndEvents(props) {
    const events = {};
    const eventKeys = Object.keys(props.events);
    for (let i = 0; i < eventKeys.length; i++) {
        const eventKey = eventKeys[i];
        const vueEventKey = "on" + eventKey.charAt(0).toUpperCase() + eventKey.slice(1);
        events[vueEventKey] = props.events[eventKey];
    }
    return { ...props.attrs, ...props.others, ...events };
}
export function vueToHfc(Comp, opts) {
    Comp.inheritAttrs = Comp.inheritAttrs || false;
    class VueHFC {
        static tag;
        static props;
        static VC = Comp;
        root;
        data;
        constructor(container, props) {
            opts.connected?.(container, props);
            this.data = reactive({
                props: toVueAttrsAndEvents(props),
                slots: toVueSlots(props),
            });
            this.root = createApp({
                data: () => this.data,
                render() {
                    return h(Comp, this.props, this.slots);
                },
            });
            this.root.mount(container);
        }
        changed(props) {
            this.data.props = toVueAttrsAndEvents(props);
            this.data.slots = toVueSlots(props);
        }
        disconnected() {
            opts.disconnected?.();
            this.root.unmount();
        }
    }
    VueHFC.tag = opts.tag;
    VueHFC.props = opts.props;
    return VueHFC;
}
