// Polyfills
import 'whatwg-fetch';

import {bigNumberConfigs} from '@0xproject/utils';
import {getMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {createStore, Store as ReduxStore} from 'redux';
import {createLazyComponent} from 'ts/lazy_component';
import {trackedTokenStorage} from 'ts/local_storage/tracked_token_storage';
import {tradeHistoryStorage} from 'ts/local_storage/trade_history_storage';
import {About} from 'ts/pages/about/about';
import {FAQ} from 'ts/pages/faq/faq';
import {Landing} from 'ts/pages/landing/landing';
import {NotFound} from 'ts/pages/not_found';
import {Wiki} from 'ts/pages/wiki/wiki';
import {reducer, State} from 'ts/redux/reducer';
import {WebsitePaths} from 'ts/types';
import {colors} from 'ts/utils/colors';
injectTapEventPlugin();

bigNumberConfigs.configure();

// Check if we've introduced an update that requires us to clear the tradeHistory local storage entries
tradeHistoryStorage.clearIfRequired();
trackedTokenStorage.clearIfRequired();

import 'basscss/css/basscss.css';
import 'less/all.less';

const muiTheme = getMuiTheme({
    appBar: {
        height: 45,
        color: colors.white,
        textColor: colors.black,
    },
    palette: {
        pickerHeaderColor: colors.lightBlue,
        primary1Color: colors.lightBlue,
        primary2Color: colors.lightBlue,
        textColor: colors.grey700,
    },
    datePicker: {
        color: colors.grey700,
        textColor: colors.white,
        calendarTextColor: colors.white,
        selectColor: colors.darkestGrey,
        selectTextColor: colors.white,
    },
    timePicker: {
        color: colors.grey700,
        textColor: colors.white,
        accentColor: colors.white,
        headerColor: colors.darkestGrey,
        selectColor: colors.darkestGrey,
        selectTextColor: colors.darkestGrey,
    },
    toggle: {
        thumbOnColor: colors.limeGreen,
        trackOnColor: colors.lightGreen,
    },
});

// We pass modulePromise returning lambda instead of module promise,
// cause we only want to import the module when the user navigates to the page.
// At the same time webpack statically parses for System.import() to determine bundle chunk split points
// so each lazy import needs it's own `System.import()` declaration.
const LazyPortal = createLazyComponent(
    'Portal', async () => System.import<any>(/* webpackChunkName: "portal" */'ts/containers/portal'),
);
const LazyZeroExJSDocumentation = createLazyComponent(
    'Documentation',
    async () => System.import<any>(/* webpackChunkName: "zeroExDocs" */'ts/containers/zero_ex_js_documentation'),
);
const LazySmartContractsDocumentation = createLazyComponent(
    'Documentation',
    async () => System.import<any>(
        /* webpackChunkName: "smartContractDocs" */'ts/containers/smart_contracts_documentation',
    ),
);
const LazyConnectDocumentation = createLazyComponent(
    'Documentation',
    async () => System.import<any>(
        /* webpackChunkName: "connectDocs" */'ts/containers/connect_documentation',
    ),
);

const store: ReduxStore<State> = createStore(reducer);
render(
    <Router>
        <div>
            <MuiThemeProvider muiTheme={muiTheme}>
                <Provider store={store}>
                    <div>
                        <Switch>
                            <Route exact={true} path="/" component={Landing as any} />
                            <Redirect from="/otc" to={`${WebsitePaths.Portal}`}/>
                            <Route path={`${WebsitePaths.Portal}`} component={LazyPortal} />
                            <Route path={`${WebsitePaths.FAQ}`} component={FAQ as any} />
                            <Route path={`${WebsitePaths.About}`} component={About as any} />
                            <Route path={`${WebsitePaths.Wiki}`} component={Wiki as any} />
                            <Route path={`${WebsitePaths.ZeroExJs}/:version?`} component={LazyZeroExJSDocumentation} />
                            <Route path={`${WebsitePaths.Connect}/:version?`} component={LazyConnectDocumentation} />
                            <Route
                                path={`${WebsitePaths.SmartContracts}/:version?`}
                                component={LazySmartContractsDocumentation}
                            />
                            <Route component={NotFound as any} />
                        </Switch>
                    </div>
                </Provider>
            </MuiThemeProvider>
        </div>
  </Router>,
    document.getElementById('app'),
);
