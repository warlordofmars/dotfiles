module PuppetLanguageServer
  module Puppetfile
    module R10K
      PUPPETFILE_MONIKER ||= 'Puppetfile'.freeze

      class Puppetfile
        attr_reader :modules

        def load!(puppetfile_contents)
          puppetfile = DSL.new(self)
          @modules = []
          puppetfile.instance_eval(puppetfile_contents, PUPPETFILE_MONIKER)
        end

        def add_module(name, args)
          @modules << Module.from_puppetfile(name, args)
        end

        class DSL
          def initialize(parent)
            @parent = parent
          end

          # @param [String] name
          # @param [*Object] args
          def mod(name, args = nil)
            @parent.add_module(name, args)
          end

          # @param [String] forge
          def forge(_location)
          end

          # @param [String] moduledir
          def moduledir(_location)
          end

          def method_missing(method, *_args) # rubocop:disable Style/MethodMissingSuper, Style/MissingRespondToMissing
            raise NoMethodError, format("Unknown method '%<method>s'", method: method)
          end
        end
      end
    end
  end
end
