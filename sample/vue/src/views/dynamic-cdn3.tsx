import { Component, Vue } from "vue-property-decorator";


@Component
export default class DynamicCdn extends Vue {

    mounted() {
        import('../try-dynamic-echarts').then(() => console.log('try-dynamic-echarts is ok'))
    }

    render() {
        return <div></div>;
    }
}