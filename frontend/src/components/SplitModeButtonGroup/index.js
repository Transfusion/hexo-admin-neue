import React, { Component } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { EditorSplitContext, MODES } from '../../utils/context/EditorSplitContextProvider';

export default class SplitModeButtonGroup extends Component {

  render() {
    return <EditorSplitContext.Consumer>

      {context => <ButtonGroup size="sm" style={{ display: 'inline-block' }}>
        <Button active={context.mode === MODES.HORIZONTAL}
          onClick={() => { context.setMode(MODES.HORIZONTAL) }}>Horiz.</Button>
        <Button active={context.mode === MODES.VERTICAL}
          onClick={() => { context.setMode(MODES.VERTICAL) }}>Vert.</Button>
        {/* <Button>Preview</Button> */}
      </ButtonGroup>
      }

    </EditorSplitContext.Consumer>
  }
}