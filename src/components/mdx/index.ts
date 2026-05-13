import React from 'react'
import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { CodeBlock } from './CodeBlock'
import { Mermaid } from './Mermaid'
import { TradingChart } from './TradingChart'

export { Callout, CodeBlock, Mermaid, TradingChart }

export const mdxComponents: MDXComponents = {
  Callout,
  Mermaid,
  TradingChart,
  pre: (props) => {
    // Mermaid blocks are pre-marked by rehypeExtractMermaid before rehype-pretty-code runs
    if ((props as Record<string, unknown>)['data-mermaid']) {
      const child = props.children as React.ReactElement<{ children?: string }>
      const chart = React.isValidElement(child) ? (child.props?.children ?? '') : ''
      return React.createElement(Mermaid, { chart })
    }
    // Fallback for plain MDX without rehype processing
    const child = props.children as React.ReactElement<{ className?: string; children?: string }>
    if (React.isValidElement(child) && child.props?.className === 'language-mermaid') {
      return React.createElement(Mermaid, { chart: child.props.children ?? '' })
    }
    return React.createElement(CodeBlock, props)
  },
}
