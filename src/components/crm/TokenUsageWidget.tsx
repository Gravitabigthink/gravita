'use client';

import React, { useState, useEffect } from 'react';
import {
    getCurrentMonthUsage,
    getBudgetStatus,
    getBudgetConfig,
    saveBudgetConfig,
    formatCost,
    formatTokens,
    formatCostMXN,
    UsageSummary,
    BudgetStatus,
    BudgetConfig
} from '@/lib/token-tracker';

interface TokenUsageWidgetProps {
    compact?: boolean;
}

export default function TokenUsageWidget({ compact = false }: TokenUsageWidgetProps) {
    const [usage, setUsage] = useState<UsageSummary | null>(null);
    const [budget, setBudget] = useState<BudgetStatus | null>(null);
    const [config, setConfig] = useState<BudgetConfig | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        refreshData();
        // Refresh every 30 seconds
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = () => {
        setUsage(getCurrentMonthUsage());
        setBudget(getBudgetStatus());
        setConfig(getBudgetConfig());
    };

    const handleSaveConfig = (newLimit: number) => {
        const newConfig: BudgetConfig = {
            monthlyLimitUSD: newLimit,
            warningThresholdPercent: 80,
            criticalThresholdPercent: 95
        };
        saveBudgetConfig(newConfig);
        setConfig(newConfig);
        setBudget(getBudgetStatus());
        setShowSettings(false);
    };

    if (!isClient || !usage || !budget || !config) {
        return (
            <div className="token-widget loading">
                <div className="animate-pulse bg-white/5 rounded-lg h-20"></div>
            </div>
        );
    }

    const statusColors = {
        ok: 'bg-green-500',
        warning: 'bg-yellow-500',
        critical: 'bg-orange-500',
        exceeded: 'bg-red-500'
    };

    const statusLabels = {
        ok: '✅ Normal',
        warning: '⚠️ Precaución',
        critical: '🔴 Crítico',
        exceeded: '🚫 Excedido'
    };

    if (compact) {
        return (
            <div className="token-widget-compact flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className={`w-2 h-2 rounded-full ${statusColors[budget.status]}`}></div>
                <span className="text-xs text-white/70">
                    {formatCostMXN(budget.currentSpendUSD)} / {formatCostMXN(budget.limitUSD)}
                </span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden ml-2">
                    <div
                        className={`h-full ${statusColors[budget.status]} transition-all`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="token-widget bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-white/10 p-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    Uso de IA
                </h3>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white/50 hover:text-white transition p-1"
                    title="Configurar presupuesto"
                >
                    ⚙️
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <label className="text-white/70 text-sm block mb-2">
                        Presupuesto mensual (USD):
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            defaultValue={config.monthlyLimitUSD}
                            min="1"
                            max="1000"
                            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                            id="budgetInput"
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('budgetInput') as HTMLInputElement;
                                handleSaveConfig(parseFloat(input.value) || 25);
                            }}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition"
                        >
                            Guardar
                        </button>
                    </div>
                    <p className="text-white/50 text-xs mt-2">
                        ≈ {formatCostMXN(config.monthlyLimitUSD)} MXN
                    </p>
                </div>
            )}

            {/* Budget Status */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${budget.status === 'ok' ? 'text-green-400' :
                            budget.status === 'warning' ? 'text-yellow-400' :
                                budget.status === 'critical' ? 'text-orange-400' :
                                    'text-red-400'
                        }`}>
                        {statusLabels[budget.status]}
                    </span>
                    <span className="text-white/70 text-sm">
                        {budget.percentUsed.toFixed(1)}%
                    </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${statusColors[budget.status]} transition-all duration-500`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/50 text-xs mb-1">Gastado</div>
                    <div className="text-white font-bold">{formatCostMXN(budget.currentSpendUSD)}</div>
                    <div className="text-white/50 text-xs">{formatCost(budget.currentSpendUSD)} USD</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/50 text-xs mb-1">Disponible</div>
                    <div className="text-green-400 font-bold">{formatCostMXN(budget.remainingUSD)}</div>
                    <div className="text-white/50 text-xs">{formatCost(budget.remainingUSD)} USD</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/50 text-xs mb-1">Tokens Usados</div>
                    <div className="text-white font-bold">{formatTokens(usage.totalTokens)}</div>
                    <div className="text-white/50 text-xs">{usage.recordCount} llamadas</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/50 text-xs mb-1">Días Restantes</div>
                    <div className="text-white font-bold">
                        {budget.estimatedDaysLeft > 30 ? '30+' : budget.estimatedDaysLeft}
                    </div>
                    <div className="text-white/50 text-xs">estimados</div>
                </div>
            </div>

            {/* Provider Breakdown */}
            <div className="border-t border-white/10 pt-3">
                <div className="text-white/50 text-xs mb-2">Por Proveedor</div>
                <div className="space-y-2">
                    {usage.byProvider.gemini.tokens > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                Gemini
                            </span>
                            <span className="text-white/70">
                                {formatTokens(usage.byProvider.gemini.tokens)} · {formatCost(usage.byProvider.gemini.costUSD)}
                            </span>
                        </div>
                    )}
                    {usage.byProvider.deepseek.tokens > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                DeepSeek
                            </span>
                            <span className="text-white/70">
                                {formatTokens(usage.byProvider.deepseek.tokens)} · {formatCost(usage.byProvider.deepseek.costUSD)}
                            </span>
                        </div>
                    )}
                    {usage.byProvider.openai.tokens > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                OpenAI
                            </span>
                            <span className="text-white/70">
                                {formatTokens(usage.byProvider.openai.tokens)} · {formatCost(usage.byProvider.openai.costUSD)}
                            </span>
                        </div>
                    )}
                    {usage.totalTokens === 0 && (
                        <div className="text-white/50 text-sm text-center py-2">
                            Sin uso este mes
                        </div>
                    )}
                </div>
            </div>

            {/* Alert for critical status */}
            {(budget.status === 'critical' || budget.status === 'exceeded') && (
                <div className={`mt-3 p-3 rounded-lg ${budget.status === 'exceeded' ? 'bg-red-500/20 border border-red-500/50' : 'bg-orange-500/20 border border-orange-500/50'
                    }`}>
                    <p className={`text-sm ${budget.status === 'exceeded' ? 'text-red-300' : 'text-orange-300'}`}>
                        {budget.status === 'exceeded'
                            ? '🚫 Has excedido tu presupuesto mensual. Considera aumentarlo o esperar al próximo mes.'
                            : '⚠️ Estás cerca de tu límite mensual. Usa la IA con moderación.'}
                    </p>
                </div>
            )}
        </div>
    );
}
