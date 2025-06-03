"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("node:fs");
var node_fetch_1 = require("node-fetch");
var FigmaToLowcodeTransformer = /** @class */ (function () {
    function FigmaToLowcodeTransformer() {
        this.sizeMapping = { xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
        this.hierarchyMapping = { Primary: 'brand', Secondary: 'neutral', Destructive: 'error' };
        this.iconMapping = { clock: 'SvgRadioSelect', placeholder: 'SvgRadioSelect' };
        this.colorVariableMapping = {
            'VariableID:13119001a2cb3bf4ec2b3be8271d31bb940fa096/37457:7': {
                color: 'text-brand-tertiary',
                hoverColor: 'hover:text-brand-secondary',
                activeColor: 'active:text-brand-secondary'
            }
        };
    }
    FigmaToLowcodeTransformer.prototype.transform = function (figmaJson, componentId) {
        var _a;
        var _b, _c, _d;
        if (componentId === void 0) { componentId = this.generateId(); }
        var figmaNode = this.extractFigmaNode(figmaJson);
        if (!figmaNode)
            throw new Error('Invalid Figma JSON structure');
        var componentProps = figmaNode.componentProperties || {};
        var textContent = this.extractTextContent(figmaNode);
        var icons = this.extractIcons(figmaNode);
        var colorInfo = this.extractColorInfo(figmaNode);
        var url = this.extractUrlInfo(figmaNode);
        return _a = {},
            _a[componentId] = {
                component: {
                    componentType: this.mapComponentType(figmaNode.name),
                    appearance: {
                        startDecorator: icons.leading || null,
                        color: this.mapHierarchyToColor((_b = componentProps.Hierarchy) === null || _b === void 0 ? void 0 : _b.value),
                        underline: "hover",
                        endDecorator: icons.trailing || null,
                        variant: this.mapSizeToVariant((_c = componentProps.Size) === null || _c === void 0 ? void 0 : _c.value),
                        disabled: this.mapStateToDisabled((_d = componentProps.State) === null || _d === void 0 ? void 0 : _d.value),
                        styles: colorInfo
                    },
                    content: __assign({ label: textContent }, (url && { url: url }))
                },
                visibility: { value: true },
                dpOn: [],
                displayName: this.generateDisplayName(figmaNode.name),
                dataSourceIds: [],
                id: componentId,
                parentId: "b_uClzo"
            },
            _a;
    };
    FigmaToLowcodeTransformer.prototype.extractFigmaNode = function (json) {
        var _a;
        var nodes = (_a = json.Result) === null || _a === void 0 ? void 0 : _a.nodes;
        return nodes ? nodes[Object.keys(nodes)[0]].document : null;
    };
    FigmaToLowcodeTransformer.prototype.findNodeByType = function (node, type) {
        var _this = this;
        var _a;
        if (node.type === type)
            return node;
        return ((_a = node.children) === null || _a === void 0 ? void 0 : _a.reduce(function (found, child) { return found || _this.findNodeByType(child, type); }, null)) || null;
    };
    FigmaToLowcodeTransformer.prototype.extractTextContent = function (node) {
        var _a;
        return ((_a = this.findNodeByType(node, 'TEXT')) === null || _a === void 0 ? void 0 : _a.characters) || 'Button CTA';
    };
    FigmaToLowcodeTransformer.prototype.extractIcons = function (node) {
        var _this = this;
        var _a, _b;
        var props = node.componentProperties || {};
        if (((_a = props.State) === null || _a === void 0 ? void 0 : _a.value) === 'Loading')
            return { leading: 'NoCodeLoader', trailing: null };
        var result = { leading: null, trailing: null };
        (_b = node.children) === null || _b === void 0 ? void 0 : _b.forEach(function (child) {
            if (child.type === 'INSTANCE' && child.componentPropertyReferences) {
                var refs = child.componentPropertyReferences;
                if (refs.visible === '⬅️ Icon leading#3287:1577')
                    result.leading = _this.iconMapping[child.name] || child.name;
                if (refs.visible === '➡️ Icon trailing#3287:2338')
                    result.trailing = _this.iconMapping[child.name] || child.name;
            }
        });
        return result;
    };
    FigmaToLowcodeTransformer.prototype.extractColorInfo = function (node) {
        var _a, _b, _c;
        var text = this.findNodeByType(node, 'TEXT');
        var id = (_c = (_b = (_a = text === null || text === void 0 ? void 0 : text.boundVariables) === null || _a === void 0 ? void 0 : _a.fills) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.id;
        return this.colorVariableMapping[id] || {
            color: "text-brand-tertiary",
            activeColor: "active:text-brand-secondary",
            hoverColor: "hover:text-brand-secondary"
        };
    };
    FigmaToLowcodeTransformer.prototype.extractUrlInfo = function (node) {
        var _a;
        var text = this.findNodeByType(node, 'TEXT');
        if (!text)
            return null;
        var allStyles = __assign({}, text.styleOverrideTable);
        if ((_a = text.characterStyleOverrides) === null || _a === void 0 ? void 0 : _a.length) {
            allStyles[text.characterStyleOverrides[0]] = allStyles[text.characterStyleOverrides[0]];
        }
        var hyperlinks = __spreadArray([text.style], Object.values(allStyles), true).filter(function (s) { var _a; return (_a = s === null || s === void 0 ? void 0 : s.hyperlink) === null || _a === void 0 ? void 0 : _a.url; })
            .map(function (s) { return s.hyperlink.url; });
        return hyperlinks[0] || null;
    };
    FigmaToLowcodeTransformer.prototype.mapComponentType = function (name) {
        return (name === null || name === void 0 ? void 0 : name.toLowerCase().includes('link')) ? 'Link' : 'Button';
    };
    FigmaToLowcodeTransformer.prototype.mapSizeToVariant = function (size) {
        return this.sizeMapping[size || ''] || 'text-sm';
    };
    FigmaToLowcodeTransformer.prototype.mapHierarchyToColor = function (hierarchy) {
        return this.hierarchyMapping[hierarchy || ''] || 'brand';
    };
    FigmaToLowcodeTransformer.prototype.mapStateToDisabled = function (state) {
        return state === 'Disabled';
    };
    FigmaToLowcodeTransformer.prototype.generateDisplayName = function (name) {
        return "".concat((name || 'Component').replace(/[\/\s]/g, '_'), "_").concat(Math.floor(Math.random() * 1000));
    };
    FigmaToLowcodeTransformer.prototype.generateId = function () {
        return 'b_' + Math.random().toString(36).slice(2, 7);
    };
    FigmaToLowcodeTransformer.prototype.transformBatch = function (components) {
        var _this = this;
        return components.reduce(function (acc, json) {
            var id = _this.generateId();
            Object.assign(acc, _this.transform(json, id));
            return acc;
        }, {});
    };
    FigmaToLowcodeTransformer.prototype.addCustomMapping = function (type, key, value) {
        var map = {
            size: this.sizeMapping,
            hierarchy: this.hierarchyMapping,
            icon: this.iconMapping,
            color: this.colorVariableMapping
        };
        if (map[type])
            map[type][key] = value;
    };
    return FigmaToLowcodeTransformer;
}());
function fetchFigmaJson(fileUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_fetch_1.default)('https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileUrl: fileUrl })
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch Figma data: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
var transformer = new FigmaToLowcodeTransformer();
function isButtonLinkComponent(figmaData) {
    var _a, _b, _c, _d, _e;
    var nodes = ((_a = figmaData === null || figmaData === void 0 ? void 0 : figmaData.result) === null || _a === void 0 ? void 0 : _a.nodes) || ((_b = figmaData === null || figmaData === void 0 ? void 0 : figmaData.Result) === null || _b === void 0 ? void 0 : _b.nodes);
    if (!nodes)
        return false;
    var _f = Object.entries(nodes)[0], _ = _f[0], mainNodeData = _f[1];
    var mainNode = mainNodeData.document;
    var children = mainNode.children || [];
    var instanceNodes = children.filter(function (child) { return child.type === "INSTANCE"; });
    var compNodes = children.filter(function (child) { return child.type === "COMPONENT"; });
    var textNodes = children.filter(function (child) { return child.type === "TEXT"; });
    var firstNodeWithComponentSets = Object.values(nodes).find(function (node) { return node.componentSets && typeof node.componentSets === "object"; });
    var firstComponentSetName = firstNodeWithComponentSets
        ? (_c = Object.values(firstNodeWithComponentSets.componentSets)[0]) === null || _c === void 0 ? void 0 : _c.name
        : null;
    var isButtonsLink = firstComponentSetName === "Buttons/Link";
    var textContentCheck = ((_e = (_d = textNodes[0]) === null || _d === void 0 ? void 0 : _d.characters) === null || _e === void 0 ? void 0 : _e.trim().length) > 0;
    var instanceNamesCheck = instanceNodes.every(function (inst) {
        return typeof inst.name === "string" && /(icon|clock|Dot|Loading)/i.test(inst.name);
    });
    var compCheck = compNodes.every(function (inst) {
        return typeof inst.name === "string" && /(icon|clock|Dot|Loading)/i.test(inst.name);
    });
    return isButtonsLink && (instanceNamesCheck || compCheck);
}
function transformFigmaFromUrl(fileUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var figmaJson, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchFigmaJson(fileUrl)];
                case 1:
                    figmaJson = _a.sent();
                    if (isButtonLinkComponent(figmaJson)) {
                        result = transformer.transform(figmaJson, 'b_CHVXi');
                        fs.writeFileSync('no-code.json', JSON.stringify(result, null, 2), 'utf-8');
                        console.log('Transformed component saved to no-code.json');
                    }
                    else {
                        console.log("Not a button link component");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Transformation failed:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var fileUrl = "https://www.figma.com/design/4r7C2sI9cktH4T8atJhmrW/Component-Sheet?node-id=1-5856&t=WXFqG3eV38cOh5qT-4";
transformFigmaFromUrl(fileUrl);
