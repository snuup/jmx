import { UpdateContext } from "index";
declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
        }
    }
}
interface EventHandler<E extends Event> {
    (event: E): void;
}
export interface AdditionalElementAttributes {
    mounted?: (n: Node) => void;
    update?: (n: Node, uc: UpdateContext) => void;
}
export interface HTMLAttributes extends AdditionalElementAttributes {
    class?: string;
    style?: string;
    accesskey?: string;
    contenteditable?: boolean;
    contextmenu?: string;
    dir?: string;
    disabled?: boolean;
    draggable?: boolean;
    hidden?: boolean;
    id?: string;
    lang?: string;
    spellcheck?: boolean;
    tabindex?: number;
    title?: string;
    role?: string;
    onCopy?: ClipboardEvent;
    onCut?: ClipboardEvent;
    onPaste?: ClipboardEvent;
    onCompositionend?: CompositionEvent;
    onCompositionstart?: CompositionEvent;
    onCompositionupdate?: CompositionEvent;
    ondrag?: EventHandler<DragEvent>;
    ondragend?: EventHandler<DragEvent>;
    ondragenter?: EventHandler<DragEvent>;
    ondragexit?: EventHandler<DragEvent>;
    ondragleave?: EventHandler<DragEvent>;
    ondragover?: EventHandler<DragEvent>;
    ondragstart?: EventHandler<DragEvent>;
    ondrop?: EventHandler<DragEvent>;
    onfocus?: (ev: FocusEvent) => void;
    onfocusout?: (ev: FocusEvent) => void;
    onblur?: (ev: FocusEvent) => void;
    onchange?: EventHandler<Event>;
    oninput?: EventHandler<Event>;
    onreset?: EventHandler<Event>;
    onsubmit?: EventHandler<Event>;
    oninvalid?: EventHandler<Event>;
    onload?: EventHandler<Event>;
    onerror?: EventHandler<Event>;
    onkeydown?: EventHandler<KeyboardEvent>;
    onkeypress?: EventHandler<KeyboardEvent>;
    onkeyup?: EventHandler<KeyboardEvent>;
    onclick?: EventHandler<MouseEvent>;
    oncontextmenu?: EventHandler<MouseEvent>;
    ondblclick?: EventHandler<MouseEvent>;
    onmousedown?: EventHandler<MouseEvent>;
    onmouseenter?: EventHandler<MouseEvent>;
    onmouseleave?: EventHandler<MouseEvent>;
    onmousemove?: EventHandler<MouseEvent>;
    onmouseout?: EventHandler<MouseEvent>;
    onmouseover?: EventHandler<MouseEvent>;
    onmouseup?: EventHandler<MouseEvent>;
    onAbort?: EventHandler<Event>;
    onCanplay?: EventHandler<Event>;
    onCanplaythrough?: EventHandler<Event>;
    onDurationchange?: EventHandler<Event>;
    onEmptied?: EventHandler<Event>;
    onEncrypted?: EventHandler<Event>;
    onEnded?: EventHandler<Event>;
    onLoadeddata?: EventHandler<Event>;
    onLoadedmetadata?: EventHandler<Event>;
    onLoadstart?: EventHandler<Event>;
    onPause?: EventHandler<Event>;
    onPlay?: EventHandler<Event>;
    onPlaying?: EventHandler<Event>;
    onProgress?: EventHandler<Event>;
    onRatechange?: EventHandler<Event>;
    onSeeked?: EventHandler<Event>;
    onSeeking?: EventHandler<Event>;
    onStalled?: EventHandler<Event>;
    onSuspend?: EventHandler<Event>;
    onTimeupdate?: EventHandler<Event>;
    onVolumechange?: EventHandler<Event>;
    onWaiting?: EventHandler<Event>;
    onSelect?: EventHandler<Event>;
    onScroll?: UIEvent;
    onTouchcancel?: TouchEvent;
    onTouchend?: TouchEvent;
    onTouchmove?: TouchEvent;
    onTouchstart?: TouchEvent;
    onWheel?: WheelEvent;
    onAnimationstart?: AnimationEvent;
    onAnimationend?: AnimationEvent;
    onAnimationiteration?: AnimationEvent;
    onTransitionend?: TransitionEvent;
    onTransitionstart?: TransitionEvent;
}
export interface AnchorHTMLAttributes extends HTMLAttributes {
    download?: any;
    href?: string;
    hreflang?: string;
    media?: string;
    rel?: string;
    target?: string;
}
export interface AreaHTMLAttributes extends HTMLAttributes {
    alt?: string;
    coord?: string;
    download?: any;
    href?: string;
    hreflang?: string;
    media?: string;
    rel?: string;
    shape?: string;
    target?: string;
}
export interface AudioHTMLAttributes extends MediaHTMLAttributes {
}
export interface BaseHTMLAttributes extends HTMLAttributes {
    href?: string;
    target?: string;
}
export interface BlockquoteHTMLAttributes extends HTMLAttributes {
    cite?: string;
}
export interface ButtonHTMLAttributes extends HTMLAttributes {
    autofocus?: boolean;
    disabled?: boolean;
    form?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: string;
    formnovalidate?: boolean;
    formtarget?: string;
    name?: string;
    type?: string;
    value?: string | string[] | number;
}
export interface CanvasHTMLAttributes extends HTMLAttributes {
    height?: number | string;
    width?: number | string;
}
export interface ColHTMLAttributes extends HTMLAttributes {
    span?: number;
}
export interface ColgroupHTMLAttributes extends ColHTMLAttributes {
}
export interface DetailsHTMLAttributes extends HTMLAttributes {
    open?: boolean;
}
export interface DelHTMLAttributes extends HTMLAttributes {
    cite?: string;
    datetime?: string;
}
export interface EmbedHTMLAttributes extends HTMLAttributes {
    height?: number | string;
    src?: string;
    type?: string;
    width?: number | string;
}
export interface FieldsetHTMLAttributes extends HTMLAttributes {
    disabled?: boolean;
    form?: string;
    name?: string;
}
export interface FormHTMLAttributes extends HTMLAttributes {
    acceptcharset?: string;
    action?: string;
    autocomplete?: string;
    enctype?: string;
    method?: string;
    name?: string;
    novalidate?: boolean;
    target?: string;
}
export interface HtmlHTMLAttributes extends HTMLAttributes {
    manifest?: string;
}
export interface IframeHTMLAttributes extends HTMLAttributes {
    allowfullscreen?: boolean;
    allowtransparency?: boolean;
    frameborder?: number | string;
    height?: number | string;
    marginheight?: number;
    marginwidth?: number;
    name?: string;
    sandbox?: string;
    scrolling?: string;
    seamless?: boolean;
    src?: string;
    srcdoc?: string;
    width?: number | string;
}
export interface ImgHTMLAttributes extends HTMLAttributes {
    alt?: string;
    height?: number | string;
    sizes?: string;
    src?: string;
    srcset?: string;
    usemap?: string;
    width?: number | string;
}
export interface InsHTMLAttributes extends HTMLAttributes {
    cite?: string;
    datetime?: string;
}
export interface InputHTMLAttributes extends HTMLAttributes {
    accept?: string;
    alt?: string;
    autocomplete?: string;
    autofocus?: boolean;
    capture?: boolean;
    checked?: boolean;
    crossorigin?: string;
    disabled?: boolean;
    form?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: string;
    formnovalidate?: boolean;
    formtarget?: string;
    height?: number | string;
    list?: string;
    max?: number | string;
    maxlength?: number;
    min?: number | string;
    minlength?: number;
    multiple?: boolean;
    name?: string;
    pattern?: string;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    size?: number;
    src?: string;
    step?: number | string;
    type?: string;
    value?: string | string[] | number;
    width?: number | string;
}
export interface KeygenHTMLAttributes extends HTMLAttributes {
    autofocus?: boolean;
    challenge?: string;
    disabled?: boolean;
    form?: string;
    keytype?: string;
    keyparams?: string;
    name?: string;
}
export interface LabelHTMLAttributes extends HTMLAttributes {
    form?: string;
    for?: string;
}
export interface LiHTMLAttributes extends HTMLAttributes {
    value?: string | string[] | number;
}
export interface LinkHTMLAttributes extends HTMLAttributes {
    href?: string;
    hreflang?: string;
    integrity?: string;
    media?: string;
    rel?: string;
    sizes?: string;
    type?: string;
}
export interface MapHTMLAttributes extends HTMLAttributes {
    name?: string;
}
export interface MenuHTMLAttributes extends HTMLAttributes {
    type?: string;
}
export interface MediaHTMLAttributes extends HTMLAttributes {
    autoplay?: boolean;
    controls?: boolean;
    crossorigin?: string;
    loop?: boolean;
    mediagroup?: string;
    muted?: boolean;
    preload?: string;
    src?: string;
}
export interface MetaHTMLAttributes extends HTMLAttributes {
    charset?: string;
    content?: string;
    httpequiv?: string;
    name?: string;
}
export interface MeterHTMLAttributes extends HTMLAttributes {
    form?: string;
    high?: number;
    low?: number;
    max?: number | string;
    min?: number | string;
    optimum?: number;
    value?: string | string[] | number;
}
export interface QuoteHTMLAttributes extends HTMLAttributes {
    cite?: string;
}
export interface ObjectHTMLAttributes extends HTMLAttributes {
    classid?: string;
    data?: string;
    form?: string;
    height?: number | string;
    name?: string;
    type?: string;
    usemap?: string;
    width?: number | string;
    wmode?: string;
}
export interface OlHTMLAttributes extends HTMLAttributes {
    reversed?: boolean;
    start?: number;
}
export interface OptgroupHTMLAttributes extends HTMLAttributes {
    disabled?: boolean;
    label?: string;
}
export interface OptionHTMLAttributes extends HTMLAttributes {
    disabled?: boolean;
    label?: string;
    selected?: boolean;
    value?: string | string[] | number;
}
export interface OutputHTMLAttributes extends HTMLAttributes {
    form?: string;
    htmlfor?: string;
    name?: string;
}
export interface ParamHTMLAttributes extends HTMLAttributes {
    name?: string;
    value?: string | string[] | number;
}
export interface ProgressHTMLAttributes extends HTMLAttributes {
    max?: number | string;
    value?: string | string[] | number;
}
export interface ScriptHTMLAttributes extends HTMLAttributes {
    async?: boolean;
    charset?: string;
    crossorigin?: string;
    defer?: boolean;
    integrity?: string;
    nonce?: string;
    src?: string;
    type?: string;
}
export interface SelectHTMLAttributes extends HTMLAttributes {
    autofocus?: boolean;
    disabled?: boolean;
    form?: string;
    multiple?: boolean;
    name?: string;
    required?: boolean;
    size?: number;
    value?: string | string[] | number;
}
export interface SourceHTMLAttributes extends HTMLAttributes {
    media?: string;
    sizes?: string;
    src?: string;
    srcset?: string;
    type?: string;
}
export interface StyleHTMLAttributes extends HTMLAttributes {
    media?: string;
    nonce?: string;
    scoped?: boolean;
    type?: string;
}
export interface TableHTMLAttributes extends HTMLAttributes {
    cellpadding?: number | string;
    cellspacing?: number | string;
    summary?: string;
}
export interface TextareaHTMLAttributes extends HTMLAttributes {
    autocomplete?: string;
    autofocus?: boolean;
    cols?: number;
    dirname?: string;
    disabled?: boolean;
    form?: string;
    maxlength?: number;
    minlength?: number;
    name?: string;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    rows?: number;
    value?: string | string[] | number;
    wrap?: string;
}
export interface TdHTMLAttributes extends HTMLAttributes {
    colspan?: number;
    headers?: string;
    rowspan?: number;
}
export interface ThHTMLAttributes extends HTMLAttributes {
    colspan?: number;
    headers?: string;
    rowspan?: number;
    scope?: string;
}
export interface TimeHTMLAttributes extends HTMLAttributes {
    datetime?: string;
}
export interface TrackHTMLAttributes extends HTMLAttributes {
    default?: boolean;
    kind?: string;
    label?: string;
    src?: string;
    srclang?: string;
}
export interface VideoHTMLAttributes extends MediaHTMLAttributes {
    height?: number | string;
    playsinline?: boolean;
    poster?: string;
    width?: number | string;
}
export interface AllHTMLAttributes extends HTMLAttributes {
    accept?: string;
    acceptcharset?: string;
    action?: boolean;
    allowfullscreen?: boolean;
    allowtransparency?: boolean;
    alt?: string;
    async?: boolean;
    autocomplete?: string;
    autofocus?: boolean;
    autoplay?: boolean;
    capture?: boolean;
    cellpadding?: number | string;
    cellspacing?: number | string;
    challenge?: string;
    charset?: string;
    checked?: boolean;
    cite?: string;
    classid?: string;
    cols?: number;
    colspan?: number;
    content?: string;
    controls?: boolean;
    coord?: string;
    crossorigin?: string;
    data?: string;
    datetime?: string;
    default?: boolean;
    defer?: boolean;
    dirname?: string;
    disabled?: boolean;
    download?: any;
    enctype?: string;
    form?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: string;
    formnovalidate?: boolean;
    formtarget?: string;
    frameborder?: number | string;
    headers?: string;
    height?: number | string;
    high?: number;
    href?: string;
    hreflang?: string;
    htmlfor?: string;
    httpequiv?: string;
    integrity?: string;
    keyparams?: string;
    keytype?: string;
    kind?: string;
    label?: string;
    list?: string;
    loop?: boolean;
    low?: number;
    manifest?: string;
    marginheight?: number;
    marginwidth?: number;
    max?: number | string;
    maxlength?: number;
    media?: string;
    mediagroup?: string;
    method?: string;
    min?: number | string;
    minlength?: number;
    multiple?: boolean;
    muted?: boolean;
    name?: string;
    nonce?: string;
    novalidate?: boolean;
    open?: boolean;
    optimum?: number;
    pattern?: string;
    placeholder?: string;
    playsinline?: boolean;
    poster?: string;
    preload?: string;
    readonly?: boolean;
    rel?: string;
    required?: boolean;
    reversed?: boolean;
    rows?: number;
    rowspan?: number;
    sandbox?: string;
    scope?: string;
    scoped?: boolean;
    scrolling?: string;
    seamless?: boolean;
    selected?: boolean;
    shape?: string;
    size?: number;
    sizes?: string;
    span?: number;
    src?: string;
    srcdoc?: string;
    srclang?: string;
    srcset?: string;
    start?: number;
    step?: number | string;
    summary?: string;
    target?: string;
    type?: string;
    usemap?: string;
    value?: string | string[] | number;
    width?: number | string;
    wmode?: string;
    wrap?: string;
}
export interface IntrinsicElementAttributes {
    a: AnchorHTMLAttributes;
    abbr: HTMLAttributes;
    address: HTMLAttributes;
    area: AreaHTMLAttributes;
    article: HTMLAttributes;
    aside: HTMLAttributes;
    audio: AudioHTMLAttributes;
    b: HTMLAttributes;
    base: BaseHTMLAttributes;
    bdi: HTMLAttributes;
    bdo: HTMLAttributes;
    big: HTMLAttributes;
    blockquote: BlockquoteHTMLAttributes;
    body: HTMLAttributes;
    br: HTMLAttributes;
    button: ButtonHTMLAttributes;
    canvas: CanvasHTMLAttributes;
    caption: HTMLAttributes;
    cite: HTMLAttributes;
    code: HTMLAttributes;
    col: ColHTMLAttributes;
    colgroup: ColgroupHTMLAttributes;
    data: HTMLAttributes;
    datalist: HTMLAttributes;
    dd: HTMLAttributes;
    del: DelHTMLAttributes;
    details: DetailsHTMLAttributes;
    dfn: HTMLAttributes;
    dialog: HTMLAttributes;
    div: HTMLAttributes;
    dl: HTMLAttributes;
    dt: HTMLAttributes;
    em: HTMLAttributes;
    embed: EmbedHTMLAttributes;
    fieldset: FieldsetHTMLAttributes;
    figcaption: HTMLAttributes;
    figure: HTMLAttributes;
    footer: HTMLAttributes;
    form: FormHTMLAttributes;
    h1: HTMLAttributes;
    h2: HTMLAttributes;
    h3: HTMLAttributes;
    h4: HTMLAttributes;
    h5: HTMLAttributes;
    h6: HTMLAttributes;
    head: HTMLAttributes;
    header: HTMLAttributes;
    hgroup: HTMLAttributes;
    hr: HTMLAttributes;
    html: HtmlHTMLAttributes;
    i: HTMLAttributes;
    iframe: IframeHTMLAttributes;
    img: ImgHTMLAttributes;
    input: InputHTMLAttributes;
    ins: InsHTMLAttributes;
    kbd: HTMLAttributes;
    keygen: KeygenHTMLAttributes;
    label: LabelHTMLAttributes;
    legend: HTMLAttributes;
    li: LiHTMLAttributes;
    link: LinkHTMLAttributes;
    main: HTMLAttributes;
    map: MapHTMLAttributes;
    mark: HTMLAttributes;
    menu: MenuHTMLAttributes;
    menuitem: HTMLAttributes;
    meta: MetaHTMLAttributes;
    meter: MeterHTMLAttributes;
    nav: HTMLAttributes;
    noscript: HTMLAttributes;
    object: ObjectHTMLAttributes;
    ol: OlHTMLAttributes;
    optgroup: OptgroupHTMLAttributes;
    option: OptionHTMLAttributes;
    output: OutputHTMLAttributes;
    p: HTMLAttributes;
    param: ParamHTMLAttributes;
    picture: HTMLAttributes;
    pre: HTMLAttributes;
    progress: ProgressHTMLAttributes;
    q: QuoteHTMLAttributes;
    rp: HTMLAttributes;
    rt: HTMLAttributes;
    ruby: HTMLAttributes;
    s: HTMLAttributes;
    samp: HTMLAttributes;
    script: ScriptHTMLAttributes;
    section: HTMLAttributes;
    select: SelectHTMLAttributes;
    small: HTMLAttributes;
    source: SourceHTMLAttributes;
    span: HTMLAttributes;
    strong: HTMLAttributes;
    style: StyleHTMLAttributes;
    sub: HTMLAttributes;
    summary: HTMLAttributes;
    sup: HTMLAttributes;
    table: TableHTMLAttributes;
    tbody: HTMLAttributes;
    td: TdHTMLAttributes;
    textarea: TextareaHTMLAttributes;
    tfoot: HTMLAttributes;
    th: ThHTMLAttributes;
    thead: HTMLAttributes;
    time: TimeHTMLAttributes;
    title: HTMLAttributes;
    tr: HTMLAttributes;
    track: TrackHTMLAttributes;
    u: HTMLAttributes;
    ul: HTMLAttributes;
    var: HTMLAttributes;
    video: VideoHTMLAttributes;
    wbr: HTMLAttributes;
}
export {};
//# sourceMappingURL=jsx.d.ts.map