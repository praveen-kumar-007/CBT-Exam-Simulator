import React, { useEffect, useState } from 'react';

export type CalculatorMode = 'Simple' | 'Scientific ES991' | 'Scientific ES82' | 'Financial';

export interface CalculatorSettings {
    enabled: boolean;
    allowedTypes: CalculatorMode[];
}

const STORAGE_KEY = 'cbt-calculator-settings';

const DEFAULT_SETTINGS: CalculatorSettings = {
    enabled: false,
    allowedTypes: ['Simple', 'Scientific ES991', 'Scientific ES82', 'Financial'],
};

export const loadCalculatorSettings = (): CalculatorSettings => {
    if (typeof window === 'undefined') {
        return DEFAULT_SETTINGS;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return DEFAULT_SETTINGS;
    }

    try {
        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            allowedTypes: Array.isArray(parsed?.allowedTypes) ? parsed.allowedTypes : DEFAULT_SETTINGS.allowedTypes,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const saveCalculatorSettings = (settings: Partial<CalculatorSettings>): CalculatorSettings => {
    const current = loadCalculatorSettings();
    const next: CalculatorSettings = {
        ...current,
        ...settings,
        allowedTypes: Array.isArray(settings.allowedTypes) ? settings.allowedTypes : current.allowedTypes,
    };
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return next;
};

export const isCalculatorAllowed = (): boolean => loadCalculatorSettings().enabled;
export const getAllowedCalculatorTypes = (): CalculatorMode[] => loadCalculatorSettings().allowedTypes;

const sanitizeExpression = (expr: string) => {
    return expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/\bEXP\b/g, 'E')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\bsin\(/g, 'Math.sin(')
        .replace(/\bcos\(/g, 'Math.cos(')
        .replace(/\btan\(/g, 'Math.tan(')
        .replace(/\basin\(/g, 'Math.asin(')
        .replace(/\bacos\(/g, 'Math.acos(')
        .replace(/\batan\(/g, 'Math.atan(')
        .replace(/\blog\(/g, 'Math.log10(')
        .replace(/\bln\(/g, 'Math.log(')
        .replace(/\bsqrt\(/g, 'Math.sqrt(')
        .replace(/\bexp\(/g, 'Math.exp(')
        .replace(/\babs\(/g, 'Math.abs(');
};

const parseVectorLiteral = (literal: string): number[] => {
    const contents = literal.slice(4, -1);
    return contents.split(',').map((value) => Number(value.trim()));
};

const parseMatrixLiteral = (literal: string): number[][] => {
    const contents = literal.slice(4, -1).trim();
    const rowMatches = contents.match(/\[([^\]]+)\]/g) || [];
    return rowMatches.map((row) => row.slice(1, -1).split(',').map((value) => Number(value.trim())));
};

const formatVector = (vector: number[]) => `[${vector.join(',')}]`;
const formatMatrix = (matrix: number[][]) => `[[${matrix.map((row) => row.join(',')).join('],[')}]]`;

const vectorAdd = (a: number[], b: number[]) => a.map((value, index) => value + (b[index] ?? 0));
const vectorSubtract = (a: number[], b: number[]) => a.map((value, index) => value - (b[index] ?? 0));

const matrixAdd = (a: number[][], b: number[][]) => a.map((row, rowIndex) => row.map((value, colIndex) => value + (b[rowIndex]?.[colIndex] ?? 0)));
const matrixSubtract = (a: number[][], b: number[][]) => a.map((row, rowIndex) => row.map((value, colIndex) => value - (b[rowIndex]?.[colIndex] ?? 0)));
const matrixMultiply = (a: number[][], b: number[][]) => {
    const rows = a.length;
    const cols = b[0].length;
    const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < cols; j += 1) {
            for (let k = 0; k < b.length; k += 1) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
};

const matrixDeterminant = (matrix: number[][]) => {
    if (matrix.length === 2 && matrix[0].length === 2 && matrix[1].length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    throw new Error('Only 2x2 matrices supported');
};

const matrixInverse = (matrix: number[][]) => {
    if (matrix.length === 2 && matrix[0].length === 2 && matrix[1].length === 2) {
        const det = matrixDeterminant(matrix);
        if (det === 0) throw new Error('Singular matrix');
        const [[a, b], [c, d]] = matrix;
        return [[d / det, -b / det], [-c / det, a / det]];
    }
    throw new Error('Only 2x2 matrices supported');
};

const evaluateVectorExpression = (expression: string) => {
    const normalized = expression.replace(/\s+/g, '');
    const tokens = normalized.match(/([+-]?vec\[[^\]]+\])/g);
    if (!tokens) return 'Error';

    let result = parseVectorLiteral(tokens[0].replace(/^[+]/, ''));
    for (let i = 1; i < tokens.length; i += 1) {
        const token = tokens[i];
        const operator = token[0];
        const vectorLiteral = operator === '+' || operator === '-' ? token.slice(1) : token;
        const vectorValue = parseVectorLiteral(vectorLiteral);
        result = operator === '-' ? vectorSubtract(result, vectorValue) : vectorAdd(result, vectorValue);
    }
    return formatVector(result);
};

const evaluateMatrixExpression = (expression: string) => {
    const normalized = sanitizeExpression(expression.replace(/\s+/g, ''));
    const detMatch = normalized.match(/^det\(mat\[\[[^\]]+\]\]\)$/);
    const invMatch = normalized.match(/^inv\(mat\[\[[^\]]+\]\]\)$/);
    if (detMatch) {
        const matrix = parseMatrixLiteral(normalized.slice(4, -1));
        return String(matrixDeterminant(matrix));
    }
    if (invMatch) {
        const matrix = parseMatrixLiteral(normalized.slice(4, -1));
        return formatMatrix(matrixInverse(matrix));
    }

    const operatorMatch = normalized.match(/^(mat\[\[[^\]]+\]\])([+\-*])(mat\[\[[^\]]+\]\])$/);
    if (!operatorMatch) return 'Error';

    const [, leftLiteral, operator, rightLiteral] = operatorMatch;
    const leftMatrix = parseMatrixLiteral(leftLiteral);
    const rightMatrix = parseMatrixLiteral(rightLiteral);

    if (operator === '+') return formatMatrix(matrixAdd(leftMatrix, rightMatrix));
    if (operator === '-') return formatMatrix(matrixSubtract(leftMatrix, rightMatrix));
    if (operator === '*') return formatMatrix(matrixMultiply(leftMatrix, rightMatrix));
    return 'Error';
};

const evaluateExpression = (expression: string) => {
    try {
        if (expression.includes('vec[')) {
            return evaluateVectorExpression(expression);
        }
        if (expression.includes('mat[[') || expression.includes('det(') || expression.includes('inv(')) {
            return evaluateMatrixExpression(expression);
        }

        const sanitized = sanitizeExpression(expression.replace(/%/g, '/100'));
        const result = Function(`"use strict"; return (${sanitized})`)();
        if (typeof result === 'number' && Number.isFinite(result)) {
            return String(Number(result.toPrecision(12))).replace(/\.0+$/, '');
        }
        return String(result);
    } catch {
        return 'Error';
    }
};

const toggleSign = (value: string) => {
    if (!value || value === '0') {
        return '0';
    }

    const lastNumberMatch = value.match(/([+\-×÷*/])?(-?\d*\.?\d+)(?!.*\d)/);
    if (lastNumberMatch) {
        const fullMatch = lastNumberMatch[0];
        const operator = lastNumberMatch[1] || '';
        const number = lastNumberMatch[2];
        const toggled = number.startsWith('-') ? number.slice(1) : `-${number}`;
        return value.slice(0, value.length - fullMatch.length) + operator + toggled;
    }

    return value.startsWith('-') ? value.slice(1) : `-${value}`;
};

const appendValue = (current: string, value: string, lastAnswer: string) => {
    if (current === 'Error') {
        return value === 'AC' ? '0' : value === 'C' ? '0' : value === '←' ? '0' : value;
    }

    if (current === '0' && value !== '.' && value !== 'E' && value !== '+/-' && value !== 'ANS') {
        return value;
    }

    if (value === '+/-') {
        return toggleSign(current);
    }

    if (value === 'ANS') {
        return current === '0' ? lastAnswer : `${current}${lastAnswer}`;
    }

    if (value === 'E' || value === 'EXP') {
        if (/[0-9.]$/.test(current)) {
            return `${current}E`;
        }
        return current;
    }

    if (value === '^' && /[+\-×÷*/]$/.test(current)) {
        return current;
    }

    return `${current}${value}`;
};

const buttonStyle: React.CSSProperties = {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '0.85rem 0.95rem',
    background: '#f8fafc',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#0f172a',
    minWidth: 52,
    textAlign: 'center',
};

const actionButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#0f172a',
    color: '#fff',
};

const displayStyle: React.CSSProperties = {
    minHeight: 58,
    background: '#0f172a',
    color: '#f8fafc',
    borderRadius: 16,
    padding: '1rem',
    fontSize: '1.55rem',
    textAlign: 'right',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
};

const modeButtonStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: 999,
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    flex: 1,
    minWidth: 100,
};

const MODE_BUTTONS: Record<CalculatorMode, string[][]> = {
    Simple: [
        ['AC', 'C', '←', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['+/-', '0', '.', '='],
    ],
    'Scientific ES991': [
        ['AC', 'C', '(', ')'],
        ['sin(', 'cos(', 'tan(', 'π'],
        ['asin(', 'acos(', 'atan(', '√('],
        ['ln(', 'log(', 'exp(', '^'],
        ['det(', 'inv(', 'vec[', 'mat[['],
        ['7', '8', '9', '÷'],
        ['4', '5', '6', '×'],
        ['1', '2', '3', '-'],
        ['0', '.', 'ANS', '+'],
        ['x²', 'x!', '1/x', '='],
    ],
    'Scientific ES82': [
        ['AC', 'C', '(', ')'],
        ['sin(', 'cos(', 'tan(', 'π'],
        ['asin(', 'acos(', 'atan(', '√('],
        ['ln(', 'log(', 'exp(', '^'],
        ['7', '8', '9', '÷'],
        ['4', '5', '6', '×'],
        ['1', '2', '3', '-'],
        ['0', '.', 'ANS', '+'],
        ['x²', 'x!', '1/x', '='],
    ],
    Financial: [
        ['AC', 'C', '←', '÷'],
        ['MC', 'MR', 'M+', 'M-'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '%', '='],
    ],
};

const Calculator: React.FC<{
    initialMode?: CalculatorMode;
    allowedTypes?: CalculatorMode[];
    popup?: boolean;
    onClose?: () => void;
    showModeSwitcher?: boolean;
}> = ({ initialMode, allowedTypes, popup = false, onClose, showModeSwitcher = true }) => {
    const availableModes = allowedTypes && allowedTypes.length > 0 ? allowedTypes : DEFAULT_SETTINGS.allowedTypes;
    const defaultMode = initialMode && availableModes.includes(initialMode) ? initialMode : availableModes[0];
    const [mode, setMode] = useState<CalculatorMode>(defaultMode);
    const [display, setDisplay] = useState('0');
    const [memory, setMemory] = useState('0');
    const [lastAnswer, setLastAnswer] = useState('0');
    const [position, setPosition] = useState(() => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            return {
                x: Math.max(16, width - 440),
                y: 100,
            };
        }
        return { x: 160, y: 100 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number; left: number; top: number } | null>(null);

    const startDrag = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
        setDragStart({ x: event.clientX, y: event.clientY, left: position.x, top: position.y });
    };

    useEffect(() => {
        if (!availableModes.includes(mode)) {
            setMode(availableModes[0]);
        }
    }, [availableModes, mode]);

    useEffect(() => {
        if (!isDragging || !dragStart) return undefined;

        const handleMouseMove = (event: MouseEvent) => {
            const deltaX = event.clientX - dragStart.x;
            const deltaY = event.clientY - dragStart.y;
            setPosition({
                x: Math.max(0, dragStart.left + deltaX),
                y: Math.max(0, dragStart.top + deltaY),
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDragStart(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    const handleButton = (value: string) => {
        if (value === 'AC') {
            setDisplay('0');
            return;
        }

        if (value === 'C') {
            setDisplay((prev) => {
                const next = prev.slice(0, -1);
                return next.length ? next : '0';
            });
            return;
        }

        if (value === '←') {
            setDisplay((prev) => {
                const next = prev.slice(0, -1);
                return next.length ? next : '0';
            });
            return;
        }

        if (value === '=') {
            setDisplay((prev) => {
                const next = evaluateExpression(prev);
                if (next !== 'Error') {
                    setLastAnswer(next);
                }
                return next === 'Error' ? 'Error' : next;
            });
            return;
        }

        if (value === 'x²') {
            setDisplay((prev) => appendValue(prev, '^2', lastAnswer));
            return;
        }

        if (value === 'x!') {
            setDisplay((prev) => {
                const match = prev.match(/(-?\d+)$/);
                if (!match) return 'Error';
                const num = Number(match[1]);
                if (num < 0 || num > 20 || !Number.isInteger(num)) return 'Error';
                const factorial = Array.from({ length: num }, (_, idx) => idx + 1).reduce((acc, val) => acc * val, 1);
                return `${prev.slice(0, prev.length - match[1].length)}${factorial}`;
            });
            return;
        }

        if (value === '1/x') {
            setDisplay((prev) => {
                const next = evaluateExpression(`1/(${prev})`);
                return next === 'Error' ? 'Error' : next;
            });
            return;
        }

        if (value === 'ANS') {
            setDisplay((prev) => appendValue(prev, lastAnswer, lastAnswer));
            return;
        }

        if (value === 'MC') {
            setMemory('0');
            return;
        }

        if (value === 'MR') {
            setDisplay(memory || '0');
            return;
        }

        if (value === 'M+') {
            setMemory(String(Number(memory || '0') + Number(evaluateExpression(display) || 0)));
            return;
        }

        if (value === 'M-') {
            setMemory(String(Number(memory || '0') - Number(evaluateExpression(display) || 0)));
            return;
        }

        setDisplay((prev) => appendValue(prev, value, lastAnswer));
    };

    const calculatorRootStyle: React.CSSProperties = popup
        ? {
              position: 'fixed',
              top: position.y,
              left: position.x,
              zIndex: 1000,
              minWidth: 340,
              maxWidth: 425,
              width: 'min(100%, 425px)',
              border: '1px solid #cbd5e1',
              borderRadius: 18,
              background: '#fff',
              boxShadow: '0 24px 40px rgba(15, 23, 42, 0.16)',
              padding: 0,
          }
        : { border: '1px solid #cbd5e1', borderRadius: 18, padding: '1rem', background: '#fff' };

    const dragHeaderStyle: React.CSSProperties = {
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: '0.85rem 1rem',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        userSelect: 'none',
    };

    const closeButtonStyle: React.CSSProperties = {
        border: 'none',
        background: 'transparent',
        fontSize: '1.3rem',
        lineHeight: 1,
        cursor: 'pointer',
        color: '#475569',
        padding: '0.15rem 0.4rem',
    };

    return (
        <div style={calculatorRootStyle}>
            {popup && (
                <div style={dragHeaderStyle} onMouseDown={startDrag}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Calculator</span>
                    <button type="button" onClick={onClose} style={closeButtonStyle} aria-label="Close calculator">
                        ×
                    </button>
                </div>
            )}

            <div style={{ padding: popup ? '1rem' : '1rem' }}>
                {showModeSwitcher && (
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {availableModes.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setMode(option)}
                                style={{
                                    ...modeButtonStyle,
                                    borderColor: mode === option ? '#2563eb' : '#cbd5e1',
                                    background: mode === option ? '#e0f2fe' : '#fff',
                                    color: mode === option ? '#0f172a' : '#0f172a',
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                <div style={displayStyle}>{display}</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(52px, 1fr))', gap: '0.65rem', marginTop: '1rem' }}>
                    {(MODE_BUTTONS[mode] || MODE_BUTTONS.Simple).flat().map((buttonValue) => (
                        <button
                            key={buttonValue}
                            type="button"
                            onClick={() => handleButton(buttonValue)}
                            style={buttonValue === '=' ? actionButtonStyle : buttonStyle}
                        >
                            {buttonValue}
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '1rem', color: '#475569', fontSize: '0.9rem' }}>
                    <div>Memory: {memory}</div>
                    <div style={{ marginTop: '0.25rem' }}>Mode: {mode}</div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
