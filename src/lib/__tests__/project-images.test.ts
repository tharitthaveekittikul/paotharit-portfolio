import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'fs'
import { getProjectImages } from '../project-images'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getProjectImages', () => {
  it('returns sorted image paths filtered to image extensions', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(
      ['z.png', 'a.jpg', 'b.webp', 'readme.md', '.DS_Store'] as unknown as ReturnType<typeof fs.readdirSync>
    )
    expect(getProjectImages('zentri')).toEqual([
      { src: '/projects/zentri/a.jpg', alt: 'A' },
      { src: '/projects/zentri/b.webp', alt: 'B' },
      { src: '/projects/zentri/z.png', alt: 'Z' },
    ])
  })

  it('returns empty array when folder does not exist', () => {
    vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    })
    expect(getProjectImages('missing')).toEqual([])
  })

  it('returns empty array for folder with no image files', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(
      ['.DS_Store', 'readme.md'] as unknown as ReturnType<typeof fs.readdirSync>
    )
    expect(getProjectImages('zentri')).toEqual([])
  })
})
