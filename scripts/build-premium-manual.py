#!/usr/bin/env python3
"""Generate a reversible visual-preview edition from the original 43-page PDF.

All source pages are included UNCHANGED as full-resolution PDF XObjects.
Additional art direction is placed around them, never over page text or photos.
This is a visual presentation preview, not an editorial reflow or approved rewrite.
"""
from pathlib import Path
import json, io, hashlib, re
import fitz

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'assets/manual/manifest.json'
DEST=ROOT/'assets/manual/premium-preview.pdf'
m=json.loads(MANIFEST.read_text(encoding='utf8'))
blob=b''.join((ROOT/name).read_bytes() for name in m['parts'])
assert len(blob)==m['byteLength'], 'Bundled manual is incomplete'
assert blob.startswith(b'%PDF-'), 'The source is not a PDF'
source=fitz.open(stream=blob,filetype='pdf')
assert source.page_count==43, f'Expected the authoritative 43-page bundle, received {source.page_count}'
out=fitz.open()
forest=(.075,.30,.21);ink=(.1,.28,.20);mint=(.92,.97,.93);gold=(.86,.66,.18);white=(1,1,1)
# New art-directed opening page, using the ORIGINAL repository illustration & emblem.
cover=out.new_page(width=595,height=842)
cover.draw_rect(cover.rect,color=None,fill=(.963,.985,.966))
cover.draw_rect(fitz.Rect(0,0,595,24),color=None,fill=forest)
cover.draw_rect(fitz.Rect(0,24,595,31),color=None,fill=gold)
cover.draw_circle((550,100),138,color=None,fill=(.89,.95,.90))
cover.draw_circle((60,720),175,color=None,fill=(.91,.962,.935))
cover.draw_circle((40,760),120,color=gold,width=2)
cover.draw_rect(fitz.Rect(42,67,553,115),color=None,fill=white)
logo=ROOT/'assets/mohw-official-logo.png'
if logo.exists():cover.insert_image(fitz.Rect(50,72,192,110),filename=str(logo),keep_proportion=True)
cover.insert_text((42,158),'MINISTRY RESOURCE  /  JAMAICA',fontsize=12,fontname='hebo',color=forest)
cover.insert_text((42,205),'SOCIAL PROTECTION',fontsize=32,fontname='hebo',color=ink)
cover.insert_text((42,246),'SERVICES SUPPORT',fontsize=32,fontname='hebo',color=ink)
cover.insert_text((42,287),'GUIDE',fontsize=32,fontname='hebo',color=ink)
cover.draw_rect(fitz.Rect(42,305,140,311),color=None,fill=gold)
cover.insert_text((42,341),'Original content. A more engaging way to explore it.',fontsize=12,fontname='helv',color=forest)
image=ROOT/'assets/about-community.webp'
if image.exists():
    cover.insert_image(fitz.Rect(42,370,553,695),filename=str(image),keep_proportion=True)
cover.draw_rect(fitz.Rect(42,720,553,787),color=None,fill=forest)
cover.insert_text((59,743),'ILLUSTRATED DIGITAL EDITION  |  DESIGN PREVIEW',fontsize=11,fontname='hebo',color=white)
cover.insert_text((59,762),'Original 43 pages follow without alteration.',fontsize=10,fontname='helv',color=white)
cover.insert_text((42,814),'Stakeholder review copy - programme details require agency verification.',fontsize=9,fontname='helv',color=ink)
# Every original page remains fully intact, including all text and embedded photographs.
for ix,pg in enumerate(source):
    o=34
    w=pg.rect.width+o*2
    h=pg.rect.height+64
    dest=out.new_page(width=w,height=h)
    dest.draw_rect(dest.rect,color=None,fill=mint)
    dest.draw_rect(fitz.Rect(0,0,w,20),color=None,fill=forest)
    dest.draw_rect(fitz.Rect(w-110,0,w,20),color=None,fill=gold)
    dest.insert_text((25,14),'MOHW  /  SOCIAL SUPPORT',fontsize=8,fontname='hebo',color=white)
    dest.draw_rect(fitz.Rect(17,26,w-17,h-38),color=(.73,.86,.75),fill=white,width=.9)
    rect=fitz.Rect(o,31,o+pg.rect.width,31+pg.rect.height)
    dest.show_pdf_page(rect,source,ix,keep_proportion=True,overlay=True)
    # Framed edges add physical-book-like depth without obscuring source pages.
    dest.draw_line((17,h-35),(w-17,h-35),color=(.72,.85,.76),width=.9)
    dest.insert_text((22,h-19),'SOURCE PAGE '+str(ix+1)+' / '+str(source.page_count),fontsize=8,fontname='hebo',color=forest)
    dest.insert_text((w-195,h-19),'VISUAL PREVIEW  •  NOT REVISED POLICY',fontsize=7,fontname='helv',color=ink)
    if len(pg.get_text('text').strip())>40:
        source_words=set(re.findall(r'\\w+',pg.get_text('text').lower()))
        dest_words=set(re.findall(r'\\w+',dest.get_text('text').lower()))
        # An unusually low overlap indicates a lost source page.
        overlap=len(source_words & dest_words)/max(1,len(source_words))
        assert overlap>.8, f'Content loss on page {ix+1}: {overlap:.2%}'
out.set_metadata({'title':'MOHW Social Support - original 43-page manual, visual preview',
                  'subject':'Source-preserving design preview. Original manual remains the approved base for comparison.'})
DEST.parent.mkdir(parents=True,exist_ok=True)
out.save(str(DEST),garbage=4,deflate=True,clean=True)
out.close();source.close()
check=fitz.open(str(DEST))
assert check.page_count==44, f'Expected 1 new cover + 43 unchanged pages, got {check.page_count}'
check.close()
print('Generated',DEST,DEST.stat().st_size,'bytes. 43 original pages preserved; 1 preview cover added.')
