// =============================================================================
// SCRIPT DE CRIAÇÃO E CONFIGURAÇÃO DA BASE: pallas_atelie (mongosh)
// Compatível com MongoDB 6.0+, 7.0+ e 8.0+
// =============================================================================

use pallas_atelie;

// 1. Criar Collection: usuarios
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["login", "email", "senha_hash", "tipo_perfil", "ativo", "criado_em", "atualizado_em"],
      properties: {
        login: { bsonType: "string", minLength: 3, maxLength: 50 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        senha_hash: { bsonType: "string" },
        tipo_perfil: { enum: ["artista", "empresa"] },
        ativo: { bsonType: "bool" },
        criado_em: { bsonType: "date" },
        atualizado_em: { bsonType: "date" }
      }
    }
  }
});

db.usuarios.createIndex({ login: 1 }, { unique: true, name: "uk_usuario_login" });
db.usuarios.createIndex({ email: 1 }, { unique: true, name: "uk_usuario_email" });

// Sub-schema: endereco (com suporte GeoJSON Point)
const enderecoSubSchema = {
  bsonType: "object",
  required: ["rua", "numero", "bairro", "cidade", "uf", "cep", "pais", "localizacao"],
  properties: {
    rua: { bsonType: "string", maxLength: 100 },
    numero: { bsonType: "string", maxLength: 20 },
    bairro: { bsonType: "string", maxLength: 80 },
    cidade: { bsonType: "string", maxLength: 80 },
    uf: { bsonType: "string", minLength: 2, maxLength: 2 },
    cep: { bsonType: "string", pattern: "^[0-9]{8}$" },
    pais: { bsonType: "string", maxLength: 50 },
    localizacao: {
      bsonType: "object",
      required: ["type", "coordinates"],
      properties: {
        type: { enum: ["Point"] },
        coordinates: {
          bsonType: "array",
          minItems: 2,
          maxItems: 2,
          items: { bsonType: "number" }
        }
      }
    }
  }
};

// Sub-schema: portfolio
const portfolioSubSchema = {
  bsonType: "object",
  required: ["cod_port", "tema", "imagens", "data_atualizacao"],
  properties: {
    cod_port: { bsonType: "int" },
    tema: { bsonType: "string", maxLength: 100 },
    descricao: { bsonType: "string", maxLength: 500 },
    imagens: {
      bsonType: "array",
      items: { bsonType: "string", pattern: "^https?://.+" }
    },
    data_atualizacao: { bsonType: "date" }
  }
};

// 2. Criar Collection: artistas
db.createCollection("artistas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario_id", "cpf", "nome", "email", "tipo_arte", "endereco", "portfolios", "criado_em", "atualizado_em"],
      properties: {
        usuario_id: { bsonType: "objectId" },
        cpf: { bsonType: "string", pattern: "^[0-9]{11}$" },
        nome: { bsonType: "string", maxLength: 120 },
        nome_artistico: { bsonType: "string", maxLength: 120 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        fone: { bsonType: "string", maxLength: 20 },
        link: { bsonType: "string", maxLength: 255 },
        obs: { bsonType: "string", maxLength: 500 },
        tipo_arte: { bsonType: "array", items: { bsonType: "string", maxLength: 50 } },
        endereco: enderecoSubSchema,
        portfolios: { bsonType: "array", items: portfolioSubSchema },
        criado_em: { bsonType: "date" },
        atualizado_em: { bsonType: "date" }
      }
    }
  }
});

db.artistas.createIndex({ usuario_id: 1 }, { unique: true, name: "uk_artista_usuario_id" });
db.artistas.createIndex({ cpf: 1 }, { unique: true, name: "uk_artista_cpf" });
db.artistas.createIndex({ tipo_arte: 1 }, { name: "idx_artista_tipo_arte" });
db.artistas.createIndex({ "endereco.localizacao": "2dsphere" }, { name: "idx_artista_geo" });
db.artistas.createIndex({ "endereco.cidade": 1, "endereco.uf": 1 }, { name: "idx_artista_localizacao" });

// 3. Criar Collection: empresas
db.createCollection("empresas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario_id", "cnpj", "razao_social", "nome_fantasia", "responsavel", "email", "tipo_arte", "endereco", "portfolios", "criado_em", "atualizado_em"],
      properties: {
        usuario_id: { bsonType: "objectId" },
        cnpj: { bsonType: "string", pattern: "^[0-9]{14}$" },
        razao_social: { bsonType: "string", maxLength: 150 },
        nome_fantasia: { bsonType: "string", maxLength: 100 },
        responsavel: { bsonType: "string", maxLength: 100 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        fone: { bsonType: "string", maxLength: 20 },
        link: { bsonType: "string", maxLength: 255 },
        obs: { bsonType: "string", maxLength: 500 },
        tipo_arte: { bsonType: "array", items: { bsonType: "string", maxLength: 50 } },
        endereco: enderecoSubSchema,
        portfolios: { bsonType: "array", items: portfolioSubSchema },
        criado_em: { bsonType: "date" },
        atualizado_em: { bsonType: "date" }
      }
    }
  }
});

db.empresas.createIndex({ usuario_id: 1 }, { unique: true, name: "uk_empresa_usuario_id" });
db.empresas.createIndex({ cnpj: 1 }, { unique: true, name: "uk_empresa_cnpj" });
db.empresas.createIndex({ tipo_arte: 1 }, { name: "idx_empresa_tipo_arte" });
db.empresas.createIndex({ "endereco.localizacao": "2dsphere" }, { name: "idx_empresa_geo" });

// 4. Criar Collection: oportunidades
db.createCollection("oportunidades", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["empresa_id", "cargo", "funcao", "tipo_arte", "status", "data_publicacao", "criado_em", "atualizado_em"],
      properties: {
        empresa_id: { bsonType: "objectId" },
        cargo: { bsonType: "string", maxLength: 100 },
        funcao: { bsonType: "string", maxLength: 1000 },
        salario: { bsonType: "decimal" },
        horario: { bsonType: "string", maxLength: 100 },
        tipo_arte: { bsonType: "array", items: { bsonType: "string", maxLength: 50 } },
        status: { enum: ["aberta", "em_analise", "encerrada"] },
        data_publicacao: { bsonType: "date" },
        criado_em: { bsonType: "date" },
        atualizado_em: { bsonType: "date" }
      }
    }
  }
});

db.oportunidades.createIndex({ empresa_id: 1, status: 1 }, { name: "idx_oportunidade_empresa_status" });
db.oportunidades.createIndex({ status: 1, data_publicacao: -1 }, { name: "idx_oportunidade_feed" });
db.oportunidades.createIndex({ tipo_arte: 1, status: 1 }, { name: "idx_oportunidade_tipo_arte" });

// 5. Criar Collection: candidaturas (Melhoria de Processo Seletivo)
db.createCollection("candidaturas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["oportunidade_id", "artista_id", "status", "data_candidatura", "criado_em", "atualizado_em"],
      properties: {
        oportunidade_id: { bsonType: "objectId" },
        artista_id: { bsonType: "objectId" },
        mensagem: { bsonType: "string", maxLength: 1000 },
        status: { enum: ["inscrito", "em_analise", "aprovado", "rejeitado"] },
        data_candidatura: { bsonType: "date" },
        criado_em: { bsonType: "date" },
        atualizado_em: { bsonType: "date" }
      }
    }
  }
});

db.candidaturas.createIndex({ oportunidade_id: 1, artista_id: 1 }, { unique: true, name: "uk_candidatura_unica" });
db.candidaturas.createIndex({ artista_id: 1, status: 1 }, { name: "idx_candidatura_artista" });

// 6. Criar Collection: parcerias
db.createCollection("parcerias", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["projeto", "objetivo", "artistas_ids", "status", "criado_em", "atualizado_em"],
      properties: {
        projeto: { bsonType: "string", maxLength: 150 },
        objetivo: { bsonType: "string", maxLength: 1000 },
        artistas_ids: {
          bsonType: "array",
          minItems: 1,
          items: { bsonType: "objectId" }
        },
        empresa_id: { bsonType: "objectId" },
        oportunidade_id: { bsonType: "objectId" },
        status: { enum: ["em_negociacao", "ativa", "concluida", "cancelada"] },
        data_inicio: { bsonType: "date" },
        data_fim: { bsonType: "date" },
        criado_em: { bsonType: "date" },
        atualizado_em: { bsonType: "date" }
      }
    }
  }
});

db.parcerias.createIndex({ artistas_ids: 1, status: 1 }, { name: "idx_parceria_artistas" });
db.parcerias.createIndex({ empresa_id: 1, status: 1 }, { sparse: true, name: "idx_parceria_empresa" });
db.parcerias.createIndex({ oportunidade_id: 1 }, { sparse: true, name: "idx_parceria_oportunidade" });

print("Banco pallas_atelie, collections e índices criados com sucesso!");
