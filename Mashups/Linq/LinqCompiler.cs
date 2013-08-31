using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.CodeDom;
using System.CodeDom.Compiler;
using System.Linq.Expressions;
using System.Reflection;
using System.IO;
using Microsoft.CSharp;
using System.Collections;

namespace Saleslogix.Social.Mashups.Linq
{
    // TODO: Do this work in a separate AppDomain so it can be unloaded dynamically as well
    class LinqCompiler
    {
        private static readonly string DO_REQUEST_METHOD_NAME = "DoRequest";
        private static readonly string GENERATE_CLASS_NAME = "GenerateClass";
        private static readonly string GENERATE_CLASS_NAMESPACE_NAME = typeof(LinqCompiler).Namespace;
        private static Dictionary<string, object> cache = new Dictionary<string, object>();

        private IList<SourceDescription> sources = new List<SourceDescription>();

        public IDictionary<string, object> Values { get; set; }
        public IList<Assembly> ExternalAssemblies { get; set; }
        public string Query { get; set; }

        public LinqCompiler(string query)
        {
            ExternalAssemblies = new List<Assembly>();
            Values = new Dictionary<string, object>();
            Query = query;
        }

        public object Evaluate()
        {
            return Evaluate<object>();
        }

        public T Evaluate<T>()
        {
            object instance;

            // Puts compiled instances in cache in order not to duplicate unnecessary assemblies
            lock (cache)
            {
                if (cache.ContainsKey(Query))
                {
                    instance = cache[Query];
                }
                else
                {
                    CompilerResults results = this.GetCompilerResults();

                    // instanciate instance of generate class
                    Type generateClassType = results.CompiledAssembly.GetType(GENERATE_CLASS_NAMESPACE_NAME + "." + GENERATE_CLASS_NAME);
                    instance = Activator.CreateInstance(generateClassType);

                    cache.Add(Query, instance);
                }
            }

            // Refreshes parameters values
            foreach (KeyValuePair<string, object> value in this.Values)
            {
                FieldInfo field = instance.GetType().GetField(value.Key);
                field.SetValue(instance, value.Value);
            }

            // Calls the generated DoRequest() method with parameter
            MethodInfo doRequestMethod = instance.GetType().GetMethod(DO_REQUEST_METHOD_NAME);
            List<IQueryable> list = new List<IQueryable>();

            foreach (SourceDescription source in this.sources)
            {
                list.Add(source.Instance.AsQueryable());
            }

            return (T)doRequestMethod.Invoke(instance, list.ToArray());

        }

        public void AddSource<T>(string name, IEnumerable<T> source)
        {
            this.sources.Add(new SourceDescription(name, typeof(IQueryable<T>), source));
        }

        private CompilerResults GetCompilerResults()
        {
            IDictionary<string, string> options = new Dictionary<string, string>();
            options.Add("CompilerVersion", "v4.0");
            CodeDomProvider provider = new CSharpCodeProvider(options);

            CodeCompileUnit compileUnit = GetCompileUnit();

            // Writes the ouptut file on the disk for debug purposes
            //FileStream generateClassFile = new FileStream("GenerateClass.cs", FileMode.Create);
            //TextWriter writer = new StreamWriter(generateClassFile);
            //provider.GenerateCodeFromCompileUnit(compileUnit, writer, new CodeGeneratorOptions());
            //writer.Close();

            CompilerParameters param = new CompilerParameters(new string[]{
                "System.dll",
                "System.Core.dll",
                typeof(LinqToTwitter.Status).Assembly.Location,
                Assembly.GetExecutingAssembly().Location
            });

            foreach (Assembly assembly in ExternalAssemblies)
            {
                param.ReferencedAssemblies.Add(assembly.Location);
            }

            param.CompilerOptions = "/t:library";
            param.GenerateInMemory = true;

            CompilerResults results = provider.CompileAssemblyFromDom(param, new CodeCompileUnit[] { compileUnit });

            if (results.Errors.HasErrors)
            {
                throw new ApplicationException("An error occured while compiling the LINQ query: \n" + FormatErrorMessages(results.Errors));
            }

            return results;
        }

        private CodeCompileUnit GetCompileUnit()
        {
            // Instanciation
            CodeCompileUnit compilUnit = new CodeCompileUnit();
            CodeNamespace namespaceGenerateClass = new CodeNamespace(GENERATE_CLASS_NAMESPACE_NAME);
            CodeTypeDeclaration generateClassDeclaration = new CodeTypeDeclaration(GENERATE_CLASS_NAME);
            IList<CodeMemberField> memberFields = new List<CodeMemberField>();
            foreach (KeyValuePair<string, object> value in this.Values)
            {
                memberFields.Add(new CodeMemberField(value.Value.GetType(), value.Key));
            }

            CodeMemberMethod doRequestMethod = new CodeMemberMethod();

            // Parameters
            compilUnit.Namespaces.Add(namespaceGenerateClass);

            namespaceGenerateClass.Types.Add(generateClassDeclaration);
            namespaceGenerateClass.Imports.Add(new CodeNamespaceImport("System.Linq"));
            namespaceGenerateClass.Imports.Add(new CodeNamespaceImport("System"));
            namespaceGenerateClass.Imports.Add(new CodeNamespaceImport("LinqToTwitter"));


            generateClassDeclaration.TypeAttributes = generateClassDeclaration.TypeAttributes | TypeAttributes.Sealed;
            foreach (CodeMemberField memberField in memberFields)
            {
                memberField.Attributes = MemberAttributes.Public;
                generateClassDeclaration.Members.Add(memberField);
            }

            generateClassDeclaration.Members.Add(doRequestMethod);

            doRequestMethod.Attributes = MemberAttributes.Public | MemberAttributes.Final;
            doRequestMethod.ReturnType = new CodeTypeReference(typeof(object));
            doRequestMethod.Name = DO_REQUEST_METHOD_NAME;

            foreach (SourceDescription source in this.sources)
            {
                doRequestMethod.Parameters.Add(new CodeParameterDeclarationExpression(source.Type, source.Name));
            }

            doRequestMethod.Statements.Add(new CodeMethodReturnStatement(new CodeSnippetExpression(Query)));

            return compilUnit;
        }

        private static string FormatErrorMessages(CompilerErrorCollection errors)
        {
            StringBuilder builder = new StringBuilder();

            foreach (CompilerError error in errors)
            {
                builder.AppendFormat("{0} : {1} -> {2}", error.Line, error.Column, error.ErrorText);
            }

            return builder.ToString();
        }

        private class SourceDescription
        {
            public string Name { get; set; }
            public Type Type { get; set; }
            public IEnumerable Instance { get; set; }

            public SourceDescription(string name, Type type, IEnumerable instance)
            {
                Name = name;
                Type = type;
                Instance = instance;
            }
        }
    }
}
