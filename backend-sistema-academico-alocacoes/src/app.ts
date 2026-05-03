import fastify from 'fastify';
import { appRoutes } from './http/routes';
import { ZodError } from 'zod';
import { env } from './env';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { 
  serializerCompiler, 
  validatorCompiler, 
  ZodTypeProvider,
  jsonSchemaTransform 
} from 'fastify-type-provider-zod';

export const app = fastify().withTypeProvider<ZodTypeProvider>();

// configuracao dos compiladores Zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// configuracao do Swagger para documentação da API
app.register(fastifySwagger, {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'Sistema de Gestão Acadêmica - API',
            description: 'API para gerenciamento de cursos, disciplinas, professores e horários acadêmicos',
            version: '1.0.0',
            contact: {
                name: 'Equipe de Desenvolvimento',
                email: 'dev@sistema-academico.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Servidor de Desenvolvimento'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    transform: jsonSchemaTransform
});

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
        return swaggerObject;
    },
    transformSpecificationClone: true
});

app.register(fastifyCors, {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // permitir envio do header Authorization pelo front-end
    allowedHeaders: ["Authorization", "Content-Type"],
});

// registrar cookie ANTES do JWT para melhor compatibilidade com verificação via cookie
app.register(fastifyCookie);

app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
        cookieName: 'refreshToken',
        signed: false,
    },
    sign: {
        expiresIn: '10m'
    }
});

app.register(appRoutes);

// error Handler Global
app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
        const errorMessages: string[] = error.validation.map((value) => {
            return value.message || 'Erro de validação'
        })

        console.log(error)

        return reply
            .status(400)
            .send({ 
                error: 'Validation Schema Error',
                message: 'Erro de validação de schema',
                issues: errorMessages,
                timestamp: new Date().toISOString(),
                path: request.url
            })
    }

    // erros de validação Zod diretos
    if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
        }));

        return reply.status(400).send({
            error: 'Validation Schema Error',
            message: 'Os dados fornecidos são inválidos',
            issues: error.flatten().fieldErrors,
            timestamp: new Date().toISOString(),
            path: request.url
        });
    }

    // erros de autenticação JWT (token ausente)
    if (
        error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
        error.code === 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE'
    ) {
        return reply.status(401).send({
            error: 'Não Autorizado',
            message: 'Nenhum token de acesso foi encontrado. Envie o header Authorization: Bearer <token> ou faça login novamente para obter um novo token.',
            timestamp: new Date().toISOString(),
            path: request.url
        });
    }

    // erros de autenticação JWT (token inválido ou expirado)
    if (
        error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED' ||
        error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID'
    ) {
        return reply.status(401).send({
            error: 'Não Autorizado',
            message: 'Token de acesso inválido ou expirado. Faça login novamente ou use /users/refresh para renovar seu token.',
            timestamp: new Date().toISOString(),
            path: request.url
        });
    }

    // erros de autorização (role)
    if (error.message?.includes('Insufficient permissions') || 
        error.message?.includes('Access denied')) {
        return reply.status(403).send({
            error: 'Acesso Negado',
            message: 'Você não tem permissão para acessar este recurso',
            timestamp: new Date().toISOString(),
            path: request.url
        });
    }

    // erros de recurso não encontrado
    if (error.statusCode === 404 || error.message?.includes('not found')) {
        return reply.status(404).send({
            error: 'Recurso Não Encontrado',
            message: 'O recurso solicitado não foi encontrado',
            timestamp: new Date().toISOString(),
            path: request.url
        });
    }

    // erros de conflito (duplicação, etc.)
    if (error.statusCode === 409 || error.message?.includes('already exists')) {
        return reply.status(409).send({
            error: 'Conflito',
            message: 'O recurso já existe ou há um conflito com os dados fornecidos',
            timestamp: new Date().toISOString(),
            path: request.url
        });
    }

    // erros de serialização de resposta
    if (error.code === 'FST_ERR_RESPONSE_SERIALIZATION') {
        return reply.status(400).send({
            error: 'Validation Schema Error',
            message: 'Schema de resposta inválido: tipos ou estrutura divergentes do contrato.',
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(env.NODE_ENV !== 'prod' && { details: error.message })
        });
    }

    // log detalhado para desenvolvimento
    if (env.NODE_ENV !== 'prod') {
        console.error('🚨 Erro capturado pelo Error Handler:');
        console.error('📍 URL:', request.method, request.url);
        console.error('🔍 Erro:', error);
        console.error('📊 Stack:', error.stack);
    } else {
        console.error(`[${new Date().toISOString()}] Error: ${error.message} - URL: ${request.method} ${request.url}`);
    }

    // erro interno do servidor (fallback)
    return reply.status(500).send({
        error: 'Erro Interno do Servidor',
        message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(env.NODE_ENV !== 'prod' && { 
            details: error.message,
            stack: error.stack 
        })
    });
});