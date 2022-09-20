import { App, createApp, h, reactive, ref } from "vue";

function toVueSlots(props: HfcProps) {
  const slots: Record<string, any> = {};
  const slotKeys = Object.keys(props.slots);
  for (let i = 0; i < slotKeys.length; i++) {
    const slotKey = slotKeys[i];
    const slotFn = props.slots[slotKey];
    slots[slotKey] = (ps: any) => {
      const container = ref(null);

      function renderSlot() {
        slotFn(container.value!, ps);
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

function toVueAttrsAndEvents(props: HfcProps) {
  const events: Record<string, any> = {};
  const eventKeys = Object.keys(props.events);
  for (let i = 0; i < eventKeys.length; i++) {
    const eventKey = eventKeys[i];
    const vueEventKey =
      "on" + eventKey.charAt(0).toUpperCase() + eventKey.slice(1);
    events[vueEventKey] = props.events[eventKey];
  }

  return { ...props.attrs, ...props.others, ...events };
}

export function vueToHfc(
  Comp: any,
  opts: {
    tag: string;
    hfc: string;
    ver: string;
    names: [string[], string[], string[]];
    connected?: (container: Element, props: HfcProps) => void;
    disconnected?: () => void;
  }
): HyperFunctionComponent {
  Comp.inheritAttrs = Comp.inheritAttrs || false;

  const HFC: HyperFunctionComponent = (container, props) => {
    opts.connected?.(container, props);
    const data = reactive({
      props: toVueAttrsAndEvents(props),
      slots: toVueSlots(props),
    });

    const root = createApp({
      data: () => data,
      render() {
        return h(Comp, this.props, this.slots);
      },
    });

    root.mount(container);

    return {
      changed(props) {
        data.props = toVueAttrsAndEvents(props);
        data.slots = toVueSlots(props);
      },

      disconnected() {
        opts.disconnected?.();
        root.unmount();
      },
    };
  };

  HFC.tag = opts.tag;
  HFC.hfc = opts.hfc;
  HFC.ver = opts.ver;
  HFC.names = opts.names;

  return HFC;
}
