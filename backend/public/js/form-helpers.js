/**
 * Utilitários compartilhados para formulários do Pallas Ateliê:
 * - Máscaras dinâmicas de CPF e Telefone
 * - Integração oficial da API do IBGE para Estados e Cidades brasileiras
 */

// Máscara e formatação de CPF: 000.000.000-00
function maskCPF(value) {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Máscara e formatação de Telefone: (00) 00000-0000 ou (00) 0000-0000
function maskPhone(value) {
    let clean = value.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 10) {
        return clean
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return clean
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

// Máscara e formatação de CNPJ: 00.000.000/0000-00
function maskCNPJ(value) {
    return value
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// Aplica máscaras nos inputs automaticamente
function applyInputMasks() {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.setAttribute('maxlength', '14');
        cpfInput.addEventListener('input', (e) => {
            e.target.value = maskCPF(e.target.value);
        });
    }

    const foneInput = document.getElementById('fone');
    if (foneInput) {
        foneInput.setAttribute('maxlength', '15');
        foneInput.addEventListener('input', (e) => {
            e.target.value = maskPhone(e.target.value);
        });
    }

    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.setAttribute('maxlength', '18');
        cnpjInput.addEventListener('input', (e) => {
            e.target.value = maskCNPJ(e.target.value);
        });
    }
}

// Lista fixa dos estados brasileiros (sigla + nome)
const ESTADOS_BRASIL = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
];

// Configura o carregamento dinâmico de estados e cidades via IBGE
function setupLocationSelects(estadoSelectId = 'estado', cidadeSelectId = 'cidade', defaultUF = 'SC') {
    const estadoSelect = document.getElementById(estadoSelectId);
    const cidadeSelect = document.getElementById(cidadeSelectId);

    if (!estadoSelect || !cidadeSelect) return;

    // Preenche estados
    estadoSelect.innerHTML = '<option value="" disabled selected>Selecione seu Estado</option>';
    ESTADOS_BRASIL.forEach(uf => {
        const option = document.createElement('option');
        option.value = uf.sigla;
        option.textContent = `${uf.nome} (${uf.sigla})`;
        if (defaultUF && uf.sigla === defaultUF) {
            option.selected = true;
        }
        estadoSelect.appendChild(option);
    });

    // Função para buscar cidades do estado selecionado na API do IBGE
    async function carregarCidades(siglaUF, cidadeSelecionada = '') {
        if (!siglaUF) {
            cidadeSelect.innerHTML = '<option value="" disabled selected>Selecione um estado primeiro</option>';
            cidadeSelect.disabled = true;
            return;
        }

        cidadeSelect.disabled = true;
        cidadeSelect.innerHTML = '<option value="" disabled selected>Carregando cidades...</option>';

        try {
            const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${siglaUF}/municipios`);
            if (!res.ok) throw new Error('Falha ao obter cidades do IBGE');
            const cidades = await res.json();

            // Ordena as cidades em ordem alfabética
            cidades.sort((a, b) => a.nome.localeCompare(b.nome));

            cidadeSelect.innerHTML = '<option value="" disabled selected>Selecione sua Cidade</option>';
            cidades.forEach(cid => {
                const opt = document.createElement('option');
                opt.value = cid.nome;
                opt.textContent = cid.nome;
                if (cidadeSelecionada && cid.nome.toLowerCase() === cidadeSelecionada.toLowerCase()) {
                    opt.selected = true;
                }
                cidadeSelect.appendChild(opt);
            });
            cidadeSelect.disabled = false;
        } catch (err) {
            console.error('Erro ao buscar cidades na API do IBGE:', err);
            // Fallback caso a API externa caia
            cidadeSelect.disabled = false;
            cidadeSelect.innerHTML = '<option value="" disabled selected>Digite ou selecione a cidade</option>';
        }
    }

    estadoSelect.addEventListener('change', (e) => {
        carregarCidades(e.target.value);
    });

    if (estadoSelect.value) {
        carregarCidades(estadoSelect.value);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyInputMasks();
});
