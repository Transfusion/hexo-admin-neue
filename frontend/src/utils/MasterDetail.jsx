import React from 'react';
import { withRouter } from 'react-router';
import MediaQuery from 'react-responsive';
import SplitPane from '@transfusion/react-split-pane';

import { Switch, Route } from 'react-router-dom';

import { bootstrapBreakpoints } from './ResponsiveHelpers';

const MasterDetail = (props) => {
  const { master, detail, match } = props;
  const { path } = match;

  // TODO: position: relative is effectively useless: see HomeScreen.css
  const desktopLayout = (
    <SplitPane
      style={{ position: 'relative' }}
      split="vertical"
      minSize={200}
      maxSize={-200}
      defaultSize={350}
    >
      <>
        <Route path={`${path}`}>
          {master}
        </Route>
      </>

      <>
        <Switch>
          <Route exact path={`${path}`}>
            {detail}
          </Route>
          <Route path={`${path}/detail/:id`}>
            {detail}
          </Route>
        </Switch>
      </>
    </SplitPane>
  );


  return (
    <MediaQuery minWidth={bootstrapBreakpoints.md}>
      {(matches) => (matches
        ? desktopLayout
        : (
          <Switch>
            <Route exact path={`${path}`}>
              {master}
            </Route>
            <Route path={`${path}/detail/:id`}>
              {detail}
            </Route>
          </Switch>
        ))}
    </MediaQuery>
  );
};


export default withRouter(MasterDetail);
