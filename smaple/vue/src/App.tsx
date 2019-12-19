import { Component, Vue } from "vue-property-decorator";
import { Button } from 'iview';
import { routerConfig } from './router';

@Component
export default class App extends Vue {
    render() {
        return (
            <div>
                <Button on-click={() => {
                    this.$router.push({ path: routerConfig.dynamicCdn.path });
                }}>click me</Button>
                <router-view></router-view>
            </div>
        );
    }
}