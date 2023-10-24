/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createEmptyHistoryState, registerHistory } from './history';
import { useEffect, useMemo } from 'react';

export function useHistory(editor, externalHistoryState, delay = 1000) {
  const historyState = useMemo(() => externalHistoryState || createEmptyHistoryState(), [externalHistoryState]);

  useEffect(() => {
    return registerHistory(editor, historyState, delay);
  }, [delay, editor, historyState]);
}
