import React from 'react';
import { FileManager, FileNavigator } from '@opuscapita/react-filemanager';
import connectorNodeV1 from '@opuscapita/react-filemanager-connector-node-v1';
import { Config } from '../../utils/Config';

const apiOptions = {
  ...connectorNodeV1.apiOptions,
  apiRoot: `${Config.routerBase}/fm_api`, // Or you local Server Node V1 installation.
};

export default (props) => (
  <div style={{ height: '100%' }}>
    <FileManager>
      <FileNavigator
        id="filemanager-1"
        api={connectorNodeV1.api}
        apiOptions={apiOptions}
        capabilities={connectorNodeV1.capabilities}
        listViewLayout={connectorNodeV1.listViewLayout}
        viewLayoutOptions={connectorNodeV1.viewLayoutOptions}
      />
    </FileManager>
  </div>
);
