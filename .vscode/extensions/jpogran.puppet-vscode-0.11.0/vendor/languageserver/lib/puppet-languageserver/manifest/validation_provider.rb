require 'puppet-lint'
module PuppetLanguageServer
  module Manifest
    module ValidationProvider
      # Similar to 'validate' this will run puppet-lint and returns
      # the manifest with any fixes applied
      #
      # Returns:
      #  [ <Int> Number of problems fixed,
      #    <String> New Content
      #  ]
      def self.fix_validate_errors(content)
        module_root = PuppetLanguageServer::DocumentStore.store_root_path
        linter_options = nil
        if module_root.nil?
          linter_options = PuppetLint::OptParser.build
        else
          Dir.chdir(module_root.to_s) { linter_options = PuppetLint::OptParser.build }
        end
        linter_options.parse!(['--fix'])

        linter = PuppetLint::Checks.new
        linter.load_data(nil, content)

        problems = linter.run(nil, content)
        problems_fixed = problems.nil? ? 0 : problems.count { |item| item[:kind] == :fixed }

        [problems_fixed, linter.manifest]
      end

      def self.validate(content, _max_problems = 100)
        result = []
        # TODO: Need to implement max_problems
        problems = 0

        module_root = PuppetLanguageServer::DocumentStore.store_root_path
        linter_options = nil
        if module_root.nil?
          linter_options = PuppetLint::OptParser.build
        else
          Dir.chdir(module_root.to_s) { linter_options = PuppetLint::OptParser.build }
        end
        linter_options.parse!([])

        begin
          linter = PuppetLint::Checks.new
          linter.load_data(nil, content)

          problems = linter.run(nil, content)
          unless problems.nil?
            problems.each do |problem|
              # Syntax errors are better handled by the puppet parser, not puppet lint
              next if problem[:kind] == :error && problem[:check] == :syntax
              # Ignore linting errors what were ignored by puppet-lint
              next if problem[:kind] == :ignored

              severity = case problem[:kind]
                         when :error
                           LanguageServer::DIAGNOSTICSEVERITY_ERROR
                         when :warning
                           LanguageServer::DIAGNOSTICSEVERITY_WARNING
                         else
                           LanguageServer::DIAGNOSTICSEVERITY_HINT
                         end

              endpos = problem[:column] - 1
              endpos = problem[:column] - 1 + problem[:token].to_manifest.length unless problem[:token].nil? || problem[:token].value.nil?

              result << LanguageServer::Diagnostic.create('severity' => severity,
                                                          'code' => problem[:check].to_s,
                                                          'fromline' => problem[:line] - 1,   # Line numbers from puppet are base 1
                                                          'toline' => problem[:line] - 1,     # Line numbers from puppet are base 1
                                                          'fromchar' => problem[:column] - 1, # Pos numbers from puppet are base 1
                                                          'tochar' => endpos,
                                                          'source' => 'Puppet',
                                                          'message' => problem[:message])
            end
          end
        # rubocop:disable Lint/HandleExceptions
        rescue StandardError => _exception
          # If anything catastrophic happens we resort to puppet parsing anyway
        end
        # rubocop:enable Lint/HandleExceptions

        # TODO: Should I wrap this thing in a big rescue block?
        Puppet[:code] = content
        env = Puppet.lookup(:current_environment)
        loaders = Puppet::Pops::Loaders.new(env)
        Puppet.override({ loaders: loaders }, 'For puppet parser validate') do
          begin
            validation_environment = env
            validation_environment.check_for_reparse
            validation_environment.known_resource_types.clear
          rescue StandardError => detail
            # Sometimes the error is in the cause not the root object itself
            detail = detail.cause if !detail.respond_to?(:line) && detail.respond_to?(:cause)
            ex_line = detail.respond_to?(:line) && !detail.line.nil? ? detail.line - 1 : nil # Line numbers from puppet exceptions are base 1
            ex_pos = detail.respond_to?(:pos) && !detail.pos.nil? ? detail.pos : nil # Pos numbers from puppet are base 1

            message = detail.respond_to?(:message) ? detail.message : nil
            message = detail.basic_message if message.nil? && detail.respond_to?(:basic_message)

            unless ex_line.nil? || ex_pos.nil? || message.nil?
              result << LanguageServer::Diagnostic.create('severity' => LanguageServer::DIAGNOSTICSEVERITY_ERROR,
                                                          'fromline' => ex_line,
                                                          'toline' => ex_line,
                                                          'fromchar' => ex_pos,
                                                          'tochar' => ex_pos + 1,
                                                          'source' => 'Puppet',
                                                          'message' => message)
            end
          end
        end

        result
      end
    end
  end
end
