import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { Mermaid } from './Mermaid'
import { TradingChart } from './TradingChart'

export { Callout, Mermaid, TradingChart }

export const mdxComponents: MDXComponents = {
  Callout,
  Mermaid,
  TradingChart,
}
