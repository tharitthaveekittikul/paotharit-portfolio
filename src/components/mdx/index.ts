import React from 'react'
import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { CodeBlock } from './CodeBlock'
import { Mermaid } from './Mermaid'
import { TradingChart } from './TradingChart'
import { ZoomableImage } from './ZoomableImage'
import { ScreenshotGrid } from './ScreenshotGrid'

export { Callout, CodeBlock, Mermaid, TradingChart, ZoomableImage, ScreenshotGrid }

export const mdxComponents: MDXComponents = {
  Callout,
  Mermaid,
  TradingChart,
  ZoomableImage,
  ScreenshotGrid,
  img: ZoomableImage as MDXComponents['img'],
  table: (props) => React.createElement('div', { className: 'overflow-x-auto' }, React.createElement('table', props)),
  code: ({ className, ...props }) => React.createElement('code', { className: `${className ?? ''} break-all`, ...props }),
  pre: (props) => {
    if ((props as Record<string, unknown>)['data-mermaid']) {
      const child = props.children as React.ReactElement<{ children?: string }>
      const chart = React.isValidElement(child) ? (child.props?.children ?? '') : ''
      return React.createElement(Mermaid, { chart })
    }
    const child = props.children as React.ReactElement<{ className?: string; children?: string }>
    if (React.isValidElement(child) && child.props?.className === 'language-mermaid') {
      return React.createElement(Mermaid, { chart: child.props.children ?? '' })
    }
    return React.createElement(CodeBlock, props)
  },
}
