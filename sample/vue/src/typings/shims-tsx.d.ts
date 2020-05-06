import Vue, { VNode } from 'vue';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode { }
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue { }
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

interface VueComponentOptions {
  ref?: any;
  class?: any;
  style?: { [key: string]: any };
  props?: any;
  slot?: string;
  name?: string;
}
declare module "vue/types/options" {

  interface ComponentOptions<V extends Vue> extends VueComponentOptions {
    [propName: string]: any;
  }
}